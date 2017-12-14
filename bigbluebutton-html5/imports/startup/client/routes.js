import React from 'react';
import { Router, Route, Redirect, IndexRoute, useRouterHistory } from 'react-router';
import { createHistory } from 'history';

import LoadingScreen from '/imports/ui/components/loading-screen/component';
import ChatContainer from '/imports/ui/components/chat/container';
import UserListContainer from '/imports/ui/components/user-list/container';
import MeetingEnded from '/imports/ui/components/meeting-ended/component';
import { joinRouteHandler, logoutRouteHandler, authenticatedRouteHandler } from './auth';
import Base from './base';


const browserHistory = useRouterHistory(createHistory)({
  basename: Meteor.settings.public.app.basename,
});

const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/logout" onEnter={logoutRouteHandler} />
    <Route
      path="/join"
      component={LoadingScreen}
      onEnter={joinRouteHandler}
    />
    <Route path="/" component={Base} onEnter={authenticatedRouteHandler} >
      <IndexRoute components={{}} />
      <Route name="users" path="users" components={{ userList: UserListContainer }} />
      <Route
        name="chat"
        path="users/chat/:chatID"
        components={{
          userList: UserListContainer,
          chat: ChatContainer,
        }}
      />
      <Redirect from="users/chat" to="/users/chat/public" />
    </Route>
    <Route name="meeting-ended" path="/ended/:endedCode" component={Base} />
    <Route name="error" path="/error/:errorCode" component={Base} />
    <Redirect from="*" to="/error/404" />
  </Router>
);
export default renderRoutes;
