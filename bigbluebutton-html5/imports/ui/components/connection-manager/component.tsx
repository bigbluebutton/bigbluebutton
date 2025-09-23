import {
  ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, ApolloLink,
} from '@apollo/client';
import { GraphQLError } from 'graphql';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { onError } from '@apollo/client/link/error';
import React, { useContext, useEffect, useRef } from 'react';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import logger from '/imports/startup/client/logger';
import apolloContextHolder from '../../core/graphql/apolloContextHolder/apolloContextHolder';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import deviceInfo from '/imports/utils/deviceInfo';
import BBBWeb from '/imports/api/bbb-web-api';
import useMeetingSettings from '/imports/ui/core/local-states/useMeetingSettings';

interface ConnectionManagerProps {
  children: React.ReactNode;
}

interface ErrorPayload extends GraphQLError {
  messageId?: string;
  message: string;
}

interface WsError {
  name: string;
  message: string;
  reason: string;
  code: number;
}

const isDetailedErrorObject = (error: unknown): error is WsError => {
  const requiredKeys = ['name', 'message', 'reason', 'code'];
  return (
    error !== null
    && typeof error === 'object'
    && requiredKeys.every((key) => Object.hasOwn(error, key))
  );
};

const DEFAULT_MAX_MUTATION_PAYLOAD_SIZE = 10485760; // 10MB
const getMaxMutationPayloadSize = () => window.meetingClientSettings?.public?.app?.maxMutationPayloadSize
  ?? DEFAULT_MAX_MUTATION_PAYLOAD_SIZE;

const estimatePayloadSize = (variables: Record<string, unknown>) => {
  const variablesAsString = JSON.stringify(variables);
  const variablesAsBlob = new Blob([variablesAsString]);
  return variablesAsBlob.size;
};

const payloadSizeCheckLink = new ApolloLink((operation, forward) => {
  if (operation.query.definitions.some((def) => 'operation' in def && def.operation === 'mutation')) {
    const size = estimatePayloadSize(operation.variables);
    const maxPayloadSize = getMaxMutationPayloadSize();

    if (size > maxPayloadSize) {
      const errorMsg = `Mutation payload is too large: ${size} bytes. ${maxPayloadSize} maximum allowed.`;
      logger.warn({
        logCode: 'graphql_payload_size_error',
        extraInfo: { errorMsg },
      }, `[GraphQL payload size error]: ${errorMsg}`);
      return null;
    }
  }

  // logger.debug(`Valid ${operation.operationName} payload. Following with the query.`);
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      logger.error({
        logCode: 'graphql_error',
        extraInfo: { message },
      }, `[GraphQL error]: Message: ${message}`);
    });
  }

  if (networkError) {
    const isMutation = networkError.message.includes('graphql actions request failed');
    if (!isMutation) {
      connectionStatus.setSubscriptionFailed(true);
    }
    logger.error({
      logCode: 'graphql_network_error',
      extraInfo: {
        name: networkError.name,
        message: networkError.message,
        stack: networkError.stack,
        networkError,
      },
    }, `[Network error]: ${networkError.message}`);
  }
});

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ children }): React.ReactNode => {
  const [apolloClient, setApolloClient] = React.useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const [graphqlUrl, setGraphqlUrl] = React.useState<string>('');
  const loadingContextInfo = useContext(LoadingContext);
  const numberOfAttempts = useRef(20);
  const [errorCounts, setErrorCounts] = React.useState(0);
  const activeSocket = useRef<WebSocket>();
  const tsLastMessageRef = useRef<number>(0);
  const tsLastPingMessageRef = useRef<number>(0);
  const terminateTimeoutRef = useRef<number>();
  const boundary = useRef(15_000);
  const [terminalError, setTerminalError] = React.useState<string | Error>('');
  const [MeetingSettings] = useMeetingSettings();
  const enableDevTools = MeetingSettings.public.app.enableApolloDevTools;
  const terminateAndRetry = MeetingSettings.public.app.terminateAndRetryConnection ?? 30_000; // Default to 30 seconds

  useEffect(() => {
    BBBWeb.index().then(({ data }) => {
      setGraphqlUrl(data.graphqlWebsocketUrl);
    }).catch((error) => {
      loadingContextInfo.setLoading(false);
      throw new Error('Error fetching GraphQL URL: '.concat(error.message || ''));
    });
    logger.info(
      {
        logCode: 'GRAPHQL_URL_FETCH',
      },
      'Fetching GraphQL URL',
    );
    loadingContextInfo.setLoading(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      const tsNow = Date.now();
      if (tsLastMessageRef.current !== 0 && tsLastPingMessageRef.current !== 0) {
        if ((tsNow - tsLastMessageRef.current > boundary.current) && connectionStatus.getServerIsResponding()) {
          connectionStatus.setServerIsResponding(false);
          if (!terminateTimeoutRef.current) {
            terminateTimeoutRef.current = window.setTimeout(() => {
              // The apollo client will try to reconnect after the connection is terminated
              // if the option to reconnect is true
              apolloContextHolder.getLink().terminate();
            }, terminateAndRetry);
          }
        } else if ((tsNow - tsLastPingMessageRef.current > boundary.current) && connectionStatus.getPingIsComing()) {
          connectionStatus.setPingIsComing(false);
        }

        if (tsNow - tsLastMessageRef.current < boundary.current && !connectionStatus.getServerIsResponding()) {
          connectionStatus.setServerIsResponding(true);
          clearTimeout(terminateTimeoutRef.current);
        } else if (tsNow - tsLastPingMessageRef.current < boundary.current && !connectionStatus.getPingIsComing()) {
          connectionStatus.setPingIsComing(true);
        }
      }
    }, 5_000);
    return () => {
      clearInterval(interval);
      if (terminateTimeoutRef.current !== undefined) {
        clearTimeout(terminateTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (errorCounts === numberOfAttempts.current) {
      throw new Error('Error connecting to server, retrying attempts exceeded');
    }
  }, [errorCounts]);

  useEffect(() => {
    if (terminalError) {
      if (typeof terminalError === 'string') {
        throw new Error(terminalError);
      } else {
        throw terminalError;
      }
    }
  }, [terminalError]);

  useEffect(() => {
    logger.info(
      {
        logCode: 'GRAPHQL_CONNECTION_INIT',
        extraInfo: {
          endpoint: graphqlUrl,
          retryAttempt: numberOfAttempts.current,
        },
      },
      'Connecting to GraphQL server',
    );
    loadingContextInfo.setLoading(true);
    if (graphqlUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('sessionToken');
      if (!sessionToken) {
        loadingContextInfo.setLoading(false);
        throw new Error('Missing session token');
      }
      sessionStorage.setItem('sessionToken', sessionToken);

      const clientSessionUUID = sessionStorage.getItem('clientSessionUUID');
      const { isMobile } = deviceInfo;

      let wsLink;
      try {
        const subscription = createClient({
          url: graphqlUrl,
          retryAttempts: numberOfAttempts.current,
          keepAlive: 99999999999,
          retryWait: async () => {
            return new Promise((res) => {
              setTimeout(() => {
                res();
              }, 10_000);
            });
          },
          shouldRetry: (error) => {
            const isDetailedError = isDetailedErrorObject(error);
            const terminated = isDetailedError && error.code === 4499;

            if (terminated) {
              logger.info({
                logCode: 'connection_terminated',
                extraInfo: {
                  errorName: error.name,
                  errorMessage: error.message,
                  errorReason: error.reason,
                  error,
                },
              }, 'Connection terminated (4499)');
            } else if (isDetailedError) {
              logger.error({
                logCode: 'connection_error',
                extraInfo: {
                  errorName: error.name,
                  errorMessage: error.message,
                  errorReason: error.reason,
                  error,
                },
              }, `Connection error (${error.code})`);
            } else {
              logger.error({
                logCode: 'connection_error',
                extraInfo: {
                  errorName: 'Error',
                  errorMessage: JSON.stringify(error),
                  errorReason: 'Unknown',
                  error,
                },
              }, `Connection error: ${(error as WsError)?.code}`);
            }
            if (error && typeof error === 'object' && 'code' in error && error.code === 4403) {
              loadingContextInfo.setLoading(false);
              setTerminalError('Server refused the connection');
              return false;
            }
            return apolloContextHolder.getShouldRetry();
          },
          connectionParams: {
            headers: {
              'X-Session-Token': sessionToken,
              'X-ClientSessionUUID': clientSessionUUID,
              'X-ClientType': 'HTML5',
              'X-ClientIsMobile': isMobile ? 'true' : 'false',
            },
          },
          on: {
            error: (error) => {
              const isDetailedError = isDetailedErrorObject(error);
              logger.error({
                logCode: 'graphql_client_error',
                extraInfo: isDetailedError ? {
                  errorName: error.name,
                  errorMessage: error.message,
                } : {
                  errorName: 'Error',
                  errorMessage: JSON.stringify(error),
                },
              }, 'Graphql Client Error occurred');
              loadingContextInfo.setLoading(false);
              connectionStatus.setConnectedStatus(false);
              setErrorCounts((prev: number) => prev + 1);
            },
            closed: (e) => {
              // Check if it's a CloseEvent (which includes HTTP errors during WebSocket handshake)
              if (e instanceof CloseEvent) {
                // if the code is 1000, it means the connection was closed normally
                if (e.code !== 1000) {
                  logger.error({
                    logCode: 'graphql_websocket_closed',
                    extraInfo: {
                      code: e.code,
                      reason: e.reason,
                    },
                  }, `WebSocket closed with code ${e.code}: ${e.reason}`);
                }
                connectionStatus.setConnectedStatus(false);
              }
            },
            connected: (socket) => {
              activeSocket.current = socket as WebSocket;
              connectionStatus.setConnectedStatus(true);
            },
            connecting: () => {
              connectionStatus.setConnectedStatus(false);
            },
            message: (message) => {
              if (message.type === 'ping') {
                tsLastPingMessageRef.current = Date.now();
              }
              if (message.type === 'error' && message.id === '-1') {
                // message ID -1 as a signal to terminate the session
                // it contains a prop message.messageId which can be used to show a proper error to the user
                logger.error({ logCode: 'graphql_server_closed_connection', extraInfo: message }, 'Graphql Server closed the connection');
                loadingContextInfo.setLoading(false);
                const payload = message.payload as ErrorPayload[];
                if (payload[0].messageId) {
                  setTerminalError(new Error(payload[0].message, { cause: payload[0].messageId }));
                } else {
                  setTerminalError(new Error('Server closed the connection', { cause: 'server_closed' }));
                }
              }
              tsLastMessageRef.current = Date.now();
            },

          },
        });
        const graphWsLink = new GraphQLWsLink(
          subscription,
        );
        wsLink = ApolloLink.from([payloadSizeCheckLink, errorLink, graphWsLink]);
        wsLink.setOnError((error) => {
          loadingContextInfo.setLoading(false);
          throw new Error('Error: on apollo connection'.concat(JSON.stringify(error) || ''));
        });
        apolloContextHolder.setLink(subscription);
      } catch (error) {
        loadingContextInfo.setLoading(false);
        throw new Error('Error creating WebSocketLink: '.concat(JSON.stringify(error) || ''));
      }
      let client;
      try {
        client = new ApolloClient({
          link: wsLink,
          cache: new InMemoryCache(),
          connectToDevTools: (process.env.NODE_ENV === 'development') || enableDevTools,
        });
        setApolloClient(client);
        apolloContextHolder.setClient(client);
      } catch (error) {
        loadingContextInfo.setLoading(false);
        throw new Error('Error creating Apollo Client: '.concat(JSON.stringify(error) || ''));
      }
    }
  },
  [graphqlUrl]);
  return (
    apolloClient
      ? (
        <ApolloProvider
          client={apolloClient}
        >
          {children}
        </ApolloProvider>
      ) : null
  );
};

export default ConnectionManager;
