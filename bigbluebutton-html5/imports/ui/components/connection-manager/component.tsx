import {
  ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, ApolloLink,
} from '@apollo/client';
import { GraphQLWsLink } from '@apollo/client/link/subscriptions';
import { createClient } from 'graphql-ws';
import { onError } from '@apollo/client/link/error';
import React, { useContext, useEffect, useRef } from 'react';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import logger from '/imports/startup/client/logger';
import apolloContextHolder from '../../core/graphql/apolloContextHolder/apolloContextHolder';
import connectionStatus from '../../core/graphql/singletons/connectionStatus';
import deviceInfo from '/imports/utils/deviceInfo';

interface ConnectionManagerProps {
  children: React.ReactNode;
}

interface Response {
  response: {
  returncode: string;
  version: string;
  apiVersion: string;
  bbbVersion: string;
  graphqlWebsocketUrl: string;
  }
}

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
      logger.warn(errorMsg);
      return null;
    }
  }

  // logger.debug(`Valid ${operation.operationName} payload. Following with the query.`);
  return forward(operation);
});

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      logger.error(`[GraphQL error]: Message: ${message}`);
    });
  }

  if (networkError) {
    logger.error(`[Network error]: ${networkError}`);
  }
});

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ children }): React.ReactNode => {
  const [graphqlUrlApolloClient, setApolloClient] = React.useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const [graphqlUrl, setGraphqlUrl] = React.useState<string>('');
  const loadingContextInfo = useContext(LoadingContext);
  const numberOfAttempts = useRef(20);
  const [errorCounts, setErrorCounts] = React.useState(0);
  const activeSocket = useRef<WebSocket>();
  const timedOut = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => {
    const pathMatch = window.location.pathname.match('^(.*)/html5client/join$');
    if (pathMatch == null) {
      throw new Error('Failed to match BBB client URI');
    }
    const serverPathPrefix = pathMatch[1];
    fetch(`https://${window.location.hostname}${serverPathPrefix}/bigbluebutton/api`, {
      headers: {
        'Content-Type': 'application/json',
      },
    }).then(async (response) => {
      const responseJson: Response = await response.json();
      setGraphqlUrl(responseJson.response.graphqlWebsocketUrl);
    }).catch((error) => {
      loadingContextInfo.setLoading(false, '');
      throw new Error('Error fetching GraphQL URL: '.concat(error.message || ''));
    });
    logger.info('Fetching GraphQL URL');
    loadingContextInfo.setLoading(true, '1/5');
  }, []);

  useEffect(() => {
    if (errorCounts === numberOfAttempts.current) {
      throw new Error('Error connecting to server, retrying attempts exceeded');
    }
  }, [errorCounts]);

  useEffect(() => {
    logger.info('Connecting to GraphQL server');
    loadingContextInfo.setLoading(true, '2/5');
    if (graphqlUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('sessionToken');
      if (!sessionToken) {
        loadingContextInfo.setLoading(false, '');
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
          keepAlive: 10_000,
          retryWait: async () => {
            return new Promise((res) => {
              setTimeout(() => {
                res();
              }, 10_000);
            });
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
              logger.error(`Error: on subscription to server: ${error}`);
              loadingContextInfo.setLoading(false, '');
              connectionStatus.setConnectedStatus(false);
              setErrorCounts((prev: number) => prev + 1);
            },
            closed: () => {
              connectionStatus.setConnectedStatus(false);
            },
            connected: (socket) => {
              activeSocket.current = socket as WebSocket;
              connectionStatus.setConnectedStatus(true);
            },
            connecting: () => {
              connectionStatus.setConnectedStatus(false);
            },
            ping: (received) => {
              if (!received) {
                timedOut.current = setTimeout(() => {
                  if (activeSocket?.current?.readyState === WebSocket.OPEN) {
                    connectionStatus.setConnectedStatus(false);
                    activeSocket?.current?.close(4408, 'Request Timeout');
                  }
                }, 5_000);
              }
            },
            pong: () => {
              clearTimeout(timedOut.current);
              if (!connectionStatus.getConnectedStatus()) {
                connectionStatus.setConnectedStatus(true);
              }
            },
          },
        });
        const graphWsLink = new GraphQLWsLink(
          subscription,
        );
        wsLink = ApolloLink.from([payloadSizeCheckLink, errorLink, graphWsLink]);
        wsLink.setOnError((error) => {
          loadingContextInfo.setLoading(false, '');
          throw new Error('Error: on apollo connection'.concat(JSON.stringify(error) || ''));
        });
        apolloContextHolder.setLink(subscription);
      } catch (error) {
        loadingContextInfo.setLoading(false, '');
        throw new Error('Error creating WebSocketLink: '.concat(JSON.stringify(error) || ''));
      }
      let client;
      try {
        client = new ApolloClient({
          link: wsLink,
          cache: new InMemoryCache(),
          connectToDevTools: true,
        });
        setApolloClient(client);
        apolloContextHolder.setClient(client);
      } catch (error) {
        loadingContextInfo.setLoading(false, '');
        throw new Error('Error creating Apollo Client: '.concat(JSON.stringify(error) || ''));
      }
    }
  },
  [graphqlUrl]);
  return (
    graphqlUrlApolloClient
      ? (
        <ApolloProvider
          client={graphqlUrlApolloClient}
        >
          {children}
        </ApolloProvider>
      ) : null
  );
};

export default ConnectionManager;
