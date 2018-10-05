/* eslint no-unused-vars: 0 */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import logger from '/imports/startup/client/logger';
import LoadingScreen from '/imports/ui/components/loading-screen/component';
import { joinRouteHandler, authenticatedRouteHandler } from '/imports/startup/client/auth';
import Base from '/imports/startup/client/base';
import { Session } from 'meteor/session';

Meteor.startup(() => {
  render(<LoadingScreen />, document.getElementById('app'));

  // Logs all uncaught exceptions to the client logger
  window.addEventListener('error', (e) => {
    const { stack } = e.error;
    let message = e.error.toString();

    // Checks if stack includes the message, if not add the two together.
    (stack.includes(message)) ? message = stack : message += `\n${stack}`;
    logger.error(message);
  });

  // TODO make this a Promise
  joinRouteHandler((value, error) => {
    authenticatedRouteHandler((valueInner, errorInner) => {
      // set defaults
      Session.set('isUserListOpen', false);
      render(<Base />, document.getElementById('app'));
    });
  });
});
