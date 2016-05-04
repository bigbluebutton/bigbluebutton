import React from 'react';
import { Router, Route, Redirect, IndexRoute, browserHistory } from 'react-router';

// route components
import AppContainer from '../../ui/components/app/AppContainer.jsx';
import UserListContainer from '../../ui/components/user-list/UserListContainer.jsx';
import ChatContainer from '../../ui/components/chat/ChatContainer.jsx';


/*
  TODO: Find out how to set a baseURL or something alike
  so we dont need to mannualy say `html5client` in every route/link
*/
export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/html5client" component={AppContainer}>
      <IndexRoute components={{}} />
      <Route name="users" path="users" components={{
        userList: UserListContainer
      }} />

      <Route name="chat" path="users/chat/:chatID" components={{
        userList: UserListContainer,
        chat: ChatContainer,
      }} />

      <Redirect from="users/chat" to="/html5client/users/chat/public" />
      <Redirect from="*" to="/html5client" />
    </Route>
  </Router>
);
