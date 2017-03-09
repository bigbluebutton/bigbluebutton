import React from 'react';
import { Router, Route, Redirect, IndexRoute, useRouterHistory } from 'react-router';
import { createHistory } from 'history';

import Base from './base';
import AuthStartup from './auth';

import ChatContainer from '/imports/ui/components/chat/container';
import UserListContainer from '/imports/ui/components/user-list/container';

const browserHistory = useRouterHistory(createHistory)({
  basename: Meteor.settings.public.app.basename,
});

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/join/:meetingID/:userID/:authToken" onEnter={AuthStartup} />
    <Route path="/" component={Base}>
      <IndexRoute components={{}} />
      <Route name="users" path="users" components={{ userList: UserListContainer }} />
      <Route name="chat" path="users/chat/:chatID" components={{
        userList: UserListContainer,
        chat: ChatContainer,
      }} />
      <Redirect from="users/chat" to="/users/chat/public" />
    </Route>
    <Redirect from="*" to="/" />
  </Router>
);
