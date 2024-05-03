import {
  ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject, ApolloLink,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import React, { useContext, useEffect } from 'react';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import logger from '/imports/startup/client/logger';
import apolloContextHolder from '../../core/graphql/apolloContextHolder/apolloContextHolder';

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

const ConnectionManager: React.FC<ConnectionManagerProps> = ({ children }): React.ReactNode => {
  const [graphqlUrlApolloClient, setApolloClient] = React.useState<ApolloClient<NormalizedCacheObject> | null>(null);
  const [graphqlUrl, setGraphqlUrl] = React.useState<string>('');
  const loadingContextInfo = useContext(LoadingContext);
  useEffect(() => {
    fetch(`https://${window.location.hostname}/bigbluebutton/api`, {
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
    loadingContextInfo.setLoading(true, '1/4');
  }, []);

  useEffect(() => {
    logger.info('Connecting to GraphQL server');
    loadingContextInfo.setLoading(true, '2/4');
    if (graphqlUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('sessionToken');
      if (!sessionToken) {
        loadingContextInfo.setLoading(false, '');
        throw new Error('Missing session token');
      }
      sessionStorage.setItem('sessionToken', sessionToken);

      let wsLink;
      try {
        const subscription = new SubscriptionClient(graphqlUrl, {
          reconnect: true,
          timeout: 30000,
          minTimeout: 30000,
          connectionParams: {
            headers: {
              'X-Session-Token': sessionToken,
            },
          },
        });
        subscription.onError(() => {
          loadingContextInfo.setLoading(false, '');
          throw new Error('Error: on subscription to server');
        });
        wsLink = new WebSocketLink(
          subscription,
        );
        wsLink = ApolloLink.from([payloadSizeCheckLink, wsLink]);
        wsLink.setOnError((error) => {
          loadingContextInfo.setLoading(false, '');
          throw new Error('Error: on apollo connection'.concat(JSON.stringify(error) || ''));
        });
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
