import React from 'react';
import { Router, Route, Redirect, IndexRoute, useRouterHistory } from 'react-router';
import { createHistory } from 'history';

import LoadingScreen from '/imports/ui/components/loading-screen/component';
import ChatContainer from '/imports/ui/components/chat/container';
import UserListContainer from '/imports/ui/components/user-list/container';
import { joinRouteHandler, logoutRouteHandler, authenticatedRouteHandler } from './auth';
import Base from './base';

const browserHistory = useRouterHistory(createHistory)({
  basename: Meteor.settings.public.app.basename,
});

const disconnect = () => {
  Meteor.disconnect();
};

const renderRoutes = () => (
  <Router history={browserHistory} >
    {/*<Route*/}
      {/*path="/join"*/}
      {/*component={LoadingScreen}*/}
      {/*onEnter={joinRouteHandler}*/}
    {/*/>*/}
    {/*<Route path="/" component={Base} onEnter={authenticatedRouteHandler} >*/}
      {/*<IndexRoute components={{}} />*/}
      {/*<Route name="users" path="users" components={{ userList: UserListContainer }} />*/}
      {/*<Route*/}
        {/*name="chat"*/}
        {/*path="users/chat/:chatID"*/}
        {/*components={{*/}
          {/*userList: UserListContainer,*/}
          {/*chat: ChatContainer,*/}
        {/*}}*/}
      {/*/>*/}
    {/*</Route>*/}
  </Router>
);

export default renderRoutes;
