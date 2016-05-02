import React from 'react';
import { Router, Route, Redirect, IndexRoute, browserHistory } from 'react-router';
import { IntlProvider } from 'react-intl';

// route components
import AppContainer from '../../ui/components/app/AppContainer.jsx';
import UserListContainer from '../../ui/components/user-list/UserListContainer.jsx';
import ChatContainer from '../../ui/components/chat/ChatContainer.jsx';

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/html5client" component={AppContainer}>
      <IndexRoute components={{}} />
      <Route name="users" path="users" components={{ sidebar: UserListContainer }} />
      <Route name="chat" path="users/chat/:chatID" components={{ sidebar: [UserListContainer, ChatContainer] }}/>
      <Redirect from="chat" to="/html5client/users/chat/public" />
      <Redirect from="*" to="/html5client" />
    </Route>
  </Router>
);
