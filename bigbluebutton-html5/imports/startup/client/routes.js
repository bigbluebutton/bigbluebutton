import React from 'react';
import { Router, Route, Redirect, IndexRoute, IndexRedirect, useRouterHistory } from 'react-router';
import { createHistory } from 'history';

// route components
import AppContainer from '../../ui/components/app/AppContainer.jsx';
import UserListContainer from '../../ui/components/user-list/UserListContainer.jsx';
import ChatContainer from '../../ui/components/chat/ChatContainer.jsx';

const browserHistory = useRouterHistory(createHistory)({
  basename: '/html5client'
});

const setCredentials = function (nextState, replace) {
  const meetingID = nextState.params.meetingID;
  const userID = nextState.params.userID;
  const authToken = nextState.params.authToken;
  if (!!meetingID) localStorage.setItem('meetingID', meetingID);
  if (!!userID) localStorage.setItem('userID', userID);
  if (!!authToken) localStorage.setItem('authToken', authToken);
};

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/join/:meetingID/:userID/:authToken" onEnter={setCredentials}>
      <IndexRedirect to="/" />
      <Route path="/" component={AppContainer} >
        <IndexRoute components={{}} />

        <Route name="users" path="users" components={{
        userList: UserListContainer
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

