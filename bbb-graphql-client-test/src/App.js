import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';
 import { WebSocketLink } from "@apollo/client/link/ws";
 import React, { useState } from "react";
import './App.css';
import { SubscriptionClient } from 'subscriptions-transport-ws';
import UserList from './UserList';
import MeetingInfo from './MeetingInfo';
import TotalOfUsers from './TotalOfUsers';
import TotalOfModerators from './TotalOfModerators';
import TotalOfViewers from './TotalOfViewers';
import TotalOfUsersTalking from './TotalOfUsersTalking';
import TotalOfUniqueNames from './TotalOfUniqueNames';
import ChatMessages from "./ChatMessages";
import ChatsInfo from "./ChatsInfo";
import ChatPublicMessages from "./ChatPublicMessages";
import Annotations from "./Annotations";
import AnnotationsHistory from "./AnnotationsHistory";
import CursorsStream from "./CursorsStream";
import CursorsAll from "./CursorsAll";
import TalkingStream from "./TalkingStream";
import MyInfo from "./MyInfo";


function App() {
  const [sessionToken, setSessionToken] = useState(null);
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);
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
    fetch('/bigbluebutton/api/enter/?sessionToken=' + sessionToken, { credentials: 'include' })
        .then((response) => response.json())
        .then((json) => {
          console.log(json.response);
          setEnterApiResponse(json.response.returncode);
          if(json?.response?.internalUserID) {
            setUserId(json.response.internalUserID);
            setUserName(json.response.fullname);
          }
        });
  }

  async function connectGraphqlServer(sessionToken) {

    setSessionToken(sessionToken);
    setJoining(false);

    const wsLink = new WebSocketLink(
      new SubscriptionClient(`wss://${window.location.hostname}/v1/graphql`, {
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
  } else if(enterApiResponse === 'FAILED') {
    console.log('Error on enter API call: ' + enterApiResponse.message);
    console.log(enterApiResponse);
  }

  return (
    <div className="App">
        {graphqlClient ? (
          <div
            style={{
              height: '100vh',
            }}
          >
          <ApolloProvider client={graphqlClient}>
            Who am I? {userName} ({userId})
            <MeetingInfo />
            <br />
            <MyInfo />
            <br />
            <UserList userId={userId} />
            <br />
            <ChatsInfo />
            <br />
            <ChatMessages userId={userId} />
            <br />
            <ChatPublicMessages userId={userId} />
            <br />
            <CursorsAll />
            <br />
            <TalkingStream />
            <br />
            <CursorsStream />
            <br />
            <Annotations />
            <br />
            <AnnotationsHistory />
            <br />
            <TotalOfUsers />
            <TotalOfModerators />
            <TotalOfViewers />
            <TotalOfUsersTalking />
            <TotalOfUniqueNames />
        </ApolloProvider>
        </div>
         ) : sessionToken == null ? 'Param sessionToken missing' : 'Loading...'}
    </div>
  );
}

export default App;
