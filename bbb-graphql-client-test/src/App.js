import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
 import { WebSocketLink } from "@apollo/client/link/ws";
 import React, { useState } from "react";
import './App.css';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import UserList from './UserList';


function App() {
  const [sessionToken, setSessionToken] = useState(null);
  const [joining, setJoining] = useState(false);
  const [graphqlClient, setGraphqlClient] = useState(null);
  const [enterApiResponse, setEnterApiResponse] = useState('');

  const queryString = window.location.search;
  const urlParams = new URLSearchParams(queryString);

  if(urlParams.has('sessionToken') && sessionToken !== urlParams.get('sessionToken')) {
    setSessionToken(urlParams.get('sessionToken'));
  }


  function callApiEnter(sessionToken) {
    // get url from input text box
    fetch('bigbluebutton/api/enter/?sessionToken=' + sessionToken, { credentials: 'include' })
        .then((response) => response.json())
        .then((json) => {
          console.log(json.response);
          setEnterApiResponse(json.response.returncode);
        });
  }

  async function connectGraphqlServer(sessionToken) {

    setSessionToken(sessionToken);
    setJoining(false);

    // const cookieResponse = await fetch("https://bbb26.bbbvm.imdt.com.br/graphql-expose-cookie", fetchOptions);
    // const cookie = await cookieResponse.text();
    const wsLink = new WebSocketLink(
      new SubscriptionClient(`wss://bbb26.bbbvm.imdt.com.br/v1/graphql`, {
        reconnect: true,
        timeout: 30000,
        connectionParams: {
          headers: {
            'X-Session-Token': sessionToken,
          }
        }
      })
    );

    setGraphqlClient(new ApolloClient({link: wsLink, cache: new InMemoryCache()}));
  }

  if(enterApiResponse === '' && joining === false && sessionToken !== null) {
    setJoining(true);
    callApiEnter(sessionToken);
  }

  if(enterApiResponse === 'SUCCESS' && !graphqlClient) {
    setTimeout(async ()=>{
      console.log(`Creating graphql socket with token ${sessionToken}`);
      await connectGraphqlServer(sessionToken);
    }, 1000);
  } else {
    console.log('Error on enter API call - check logs');
  }

  return (
    <div className="App">
      <header className="App-header">
        {graphqlClient ? (
          <div
            style={{
              height: '100vh',
            }}
          >
          <ApolloProvider client={graphqlClient}>
            <div
              style={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
              }}
            >
              <UserList />
            </div>
        </ApolloProvider>
        </div>
         ) : sessionToken == null ? 'Param sessionToken missing' : 'Loading...'}
      </header>
    </div>
  );
}

export default App;
