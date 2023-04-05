import { ApolloClient, ApolloProvider, InMemoryCache, NormalizedCacheObject } from '@apollo/client';
// import { WebSocketLink } from "@apollo/client/link/ws";
import { WebSocketLink } from "@apollo/client/link/ws";
import { SubscriptionClient } from 'subscriptions-transport-ws';
import React, { useEffect } from 'react';
import Auth from '/imports/ui/services/auth';

interface Props {
  children: React.ReactNode;
}

const GraphqlProvider = ({children}: Props): React.ReactNode => {
  const [link, setLink] = React.useState<WebSocketLink | null>(null);
  const [apolloClient, setApolloClient] = React.useState<ApolloClient<NormalizedCacheObject> | null>(null);
  useEffect(() => {
    const wsLink = new WebSocketLink(
      new SubscriptionClient(`wss://${window.location.hostname}/v1/graphql`, {
        reconnect: true,
        timeout: 30000,
        connectionParams: {
          headers: {
            'X-Session-Token': Auth.sessionToken,
          }
        }
      })
    );
    setLink(wsLink);
    const client = new ApolloClient({link: wsLink, cache: new InMemoryCache()});
    setApolloClient(client);
  }, []);
  return (
    apolloClient &&
    <ApolloProvider
      client={apolloClient}
    >
      {children}
    </ApolloProvider>
    );
};

export default GraphqlProvider;
