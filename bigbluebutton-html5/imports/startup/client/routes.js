import React from 'react';
import { Router, Route, Redirect, IndexRoute, useRouterHistory } from 'react-router';
import { createHistory } from 'history';

// route components
import AppContainer from '/imports/ui/components/app/container';
import { subscribeToCollections, setCredentials } from '/imports/ui/components/app/service';

import ChatContainer from '/imports/ui/components/chat/container';
import UserListContainer from '/imports/ui/components/user-list/container';

const browserHistory = useRouterHistory(createHistory)({
  // Name displayed in the brower URL
  basename: Meteor.settings.public.app.basename,
});

export const renderRoutes = () => (
  <Router history={browserHistory}>
    <Route path="/join/:meetingID/:userID/:authToken" onEnter={setCredentials} />
    <Route path="/" onEnter={() => {
      subscribeToCollections();
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
