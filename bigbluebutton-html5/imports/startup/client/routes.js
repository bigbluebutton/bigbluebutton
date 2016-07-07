import React from 'react';
import { Router, Route, Redirect, IndexRoute,
  IndexRedirect, useRouterHistory } from 'react-router';
import { createHistory } from 'history';
import { isSubscribedForData } from '/imports/ui/components/app/service';

// route components
import AppContainer from '/imports/ui/components/app/container';
import { subscribeToCollections, setCredentials, subscribeForData, subscribeFor } from '/imports/ui/components/app/service';

import ChatContainer from '/imports/ui/components/chat/container';
import UserListContainer from '/imports/ui/components/user-list/container';
import Loader from '/imports/ui/components/loader/component';

const browserHistory = useRouterHistory(createHistory)({
  basename: '/html5client',
});

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/join/:meetingID/:userID/:authToken" onEnter={setCredentials} />
    <Route path="/" onEnter={() => {
        subscribeToCollections()
      }}
      getComponent={(nextState, cb) => {
        subscribeToCollections(() => cb(null, AppContainer));
      }}>
      <IndexRoute components={{}} />

      <Route name="users" path="users" getComponents={(nextState, cb) => {
        subscribeToCollections(() => cb(null, {
          userList: UserListContainer,
        }));
      }} />

      <Route name="chat" path="users/chat/:chatID" getComponents={(nextState, cb) => {
        subscribeToCollections(() => cb(null, {
          userList: UserListContainer,
          chat: ChatContainer,
        }));
      }} />

      <Redirect from="users/chat" to="/users/chat/public" />
    </Route>
    <Redirect from="*" to="/" />
  </Router>
);
