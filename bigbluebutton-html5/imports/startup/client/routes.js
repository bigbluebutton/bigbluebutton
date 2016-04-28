import React from 'react';
import { Router, Route, Redirect, IndexRoute, browserHistory } from 'react-router';

// route components
import AppContainer from '../../ui/app/AppContainer.jsx';
import UserListContainer from '../../ui/user-list/UserListContainer.jsx';
import ChatContainer from '../../ui/chat/ChatContainer.jsx';
import NotFoundPage from '../../ui/not-found/NotFoundPage.jsx';

import NavbarContainer from '../../ui/navbar/NavbarContainer.jsx';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/html5client" component={AppContainer}>
      <IndexRoute components={{}}/>

      <Route name="users" path="users" components={{sidebar: UserListContainer}}>
        <Route name="chat" path="chat/:chatID" component={ChatContainer}/>
        <Redirect from="chat" to="/html5client/users/chat/public" />
      </Route>

      <Redirect from="*" to="/html5client" />
    </Route>
  </Router>
);
