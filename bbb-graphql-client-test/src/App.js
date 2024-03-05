import {ApolloClient, ApolloProvider, gql, InMemoryCache, useQuery, useSubscription} from '@apollo/client';
 import { WebSocketLink } from "@apollo/client/link/ws";
 import React, {useEffect, useState} from "react";
import './App.css';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import Auth from "./Auth";


function App() {
  const [sessionToken, setSessionToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
  const [userAuthToken, setUserAuthToken] = useState(null);
  const [graphqlClient, setGraphqlClient] = useState(null);
  const [enterApiResponse, setEnterApiResponse] = useState('');
  const [graphqlConnected, setGraphqlConnected] = useState(false);
  const [graphqlError, setGraphqlError] = useState('');

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);


    const findSessionToken = async () => {
        if (urlParams.has('sessionToken')) {
            const sessionTokenFromUrl = urlParams.get('sessionToken');

            if (sessionTokenFromUrl !== null &&
                sessionTokenFromUrl !== '' &&
                sessionToken !== sessionTokenFromUrl) {
                setSessionToken(sessionTokenFromUrl);
            }
        }
    };

    useEffect(() => {
        findSessionToken();
    },[]);

  async function connectGraphqlServer(sessionToken) {
      if(sessionToken == null) return;
      console.log('connectGraphqlServer');

      const subscriptionClient = new SubscriptionClient(`wss://${window.location.hostname}/v1/graphql`, {
          reconnect: true,
          timeout: 30000,
          connectionParams: {
              headers: {
                  'X-Session-Token': sessionToken,
                  'json-patch-supported': 'true'
              }
          },
          connectionCallback: (error) => {
              console.log('connectionCallback');
              console.log(error);
              if (error) {
                  // Check if the error is the specific authentication error
                  const errorMessage = error.message;
                  if (typeof errorMessage === 'string' && errorMessage.includes('Authentication hook unauthorized this request')) {
                      console.error('Authentication Error:', errorMessage);
                      setGraphqlError('Authentication Error:' + errorMessage);
                      // Handle the authentication error here
                  } else {
                      console.error('WebSocket Connection Error:', error);
                      setGraphqlError('WebSocket Connection Error:' + error);
                  }
              } else {
                  console.log('WebSocket Connected');
              }
          }
      });

      // Listening for successful connection
      subscriptionClient.onConnected(() => {
          console.log('WebSocket Connected');

          setGraphqlConnected(true);

          // Perform actions after successful connection if needed
      });

      // Listening for errors
      subscriptionClient.onError((error) => {
          console.error('WebSocket Error', error);
          setGraphqlError('WebSocket Error', error);
      });

      // Listening for disconnection
      subscriptionClient.onDisconnected(() => {
          console.log('WebSocket Disconnected');
          // Handle disconnection scenario
      });


    // setSessionToken(sessionToken);
    const wsLink = new WebSocketLink(subscriptionClient);

    setGraphqlClient(new ApolloClient({link: wsLink, cache: new InMemoryCache()}));
  }

    useEffect(() => {
        connectGraphqlServer(sessionToken);

    },[sessionToken]);


  return (
    <div className="App">
        {graphqlClient && graphqlConnected ? (
          <div
            style={{
              height: '100vh',
            }}
          >
          <ApolloProvider client={graphqlClient}>
            {/*Who am I? {userName} ({userId})*/}
            <Auth />
        </ApolloProvider>
        </div>
         ) : sessionToken == null ? 'Param sessionToken missing' : (graphqlError === '' ? 'Loading...' : graphqlError)}
    </div>
  );
}

export default App;
