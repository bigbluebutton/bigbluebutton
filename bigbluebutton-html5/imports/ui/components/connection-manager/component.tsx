import {
  ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject,
} from '@apollo/client';
import { WebSocketLink } from '@apollo/client/link/ws';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import React, { useContext, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';

interface Props {
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

const ConnectionManager = ({ children }: Props): React.ReactNode => {
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
      throw new Error('Error fetching GraphQL URL: '.concat(error.message || ''));
    });
    loadingContextInfo.setLoading(true, 'Fetching GraphQL URL');
  }, []);

  useEffect(() => {
    loadingContextInfo.setLoading(true, 'Connecting to GraphQL server');
    if (graphqlUrl) {
      const urlParams = new URLSearchParams(window.location.search);
      const sessionToken = urlParams.get('sessionToken');
      if (!sessionToken) {
        throw new Error('Missing session token');
      }
      let wsLink;
      try {
        const subscription = new SubscriptionClient(graphqlUrl, {
          reconnect: true,
          timeout: 30000,
          connectionParams: {
            headers: {
              'X-Session-Token': sessionToken,
            },
          },
        });
        subscription.onError(() => {
          throw new Error('Error: on subscription to server');
        });
        wsLink = new WebSocketLink(
          subscription,
        );
        wsLink.setOnError((error) => {
          throw new Error('Error: on apollo connection'.concat(JSON.stringify(error) || ''));
        });
      } catch (error) {
        throw new Error('Error creating WebSocketLink: '.concat(JSON.stringify(error) || ''));
      }
      let client;
      try {
        client = new ApolloClient({
          link: wsLink,
          cache: new InMemoryCache(),
          connectToDevTools: Meteor.isDevelopment,
        });
        setApolloClient(client);
      } catch (error) {
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
