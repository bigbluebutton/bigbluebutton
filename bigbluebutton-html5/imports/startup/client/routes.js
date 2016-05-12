import React from 'react';
import { Router, Route, Redirect, IndexRoute,
  IndexRedirect, useRouterHistory } from 'react-router';
import { createHistory } from 'history';

// route components
import AppContainer from '../../ui/components/app/AppContainer.jsx';
import {setCredentials, subscribeForData} from '../../ui/components/app/AppService.js';
import UserListContainer from '../../ui/components/user-list/UserListContainer.jsx';
import ChatContainer from '../../ui/components/chat/ChatContainer.jsx';

const browserHistory = useRouterHistory(createHistory)({
  basename: '/html5client'
});

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/join/:meetingID/:userID/:authToken" onEnter={setCredentials} >
      <IndexRedirect to="/" />
      <Route path="/" component={AppContainer} onEnter={subscribeForData} >
        <IndexRoute components={{}} />

        <Route name="users" path="users" components={{
          userList: UserListContainer,
        }} />

        <Route name="chat" path="users/chat/:chatID" components={{
          userList: UserListContainer,
          chat: ChatContainer,
        }} />
        <Redirect from="users/chat" to="/users/chat/public" />
      </Route>
      <Redirect from="*" to="/" />
    </Route>
  </Router>
);
