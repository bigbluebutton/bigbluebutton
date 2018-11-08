/* eslint no-unused-vars: 0 */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { Session } from 'meteor/session';
import { render } from 'react-dom';
import logger from '/imports/startup/client/logger';
import { joinRouteHandler, authenticatedRouteHandler } from '/imports/startup/client/auth';
import Base from '/imports/startup/client/base';
import LoadingScreen from '/imports/ui/components/loading-screen/component';

Meteor.startup(() => {
  render(<LoadingScreen />, document.getElementById('app'));

  // Logs all uncaught exceptions to the client logger
  window.addEventListener('error', (e) => {
    const { stack } = e.error;
    let message = e.error.toString();

    // Checks if stack includes the message, if not add the two together.
    if (stack.includes(message)) {
      message = stack;
    } else {
      message += `\n${stack}`;
    }
    logger.error(message);
  });

  // TODO make this a Promise
  joinRouteHandler((value, error) => {
    if (error) {
      logger.error(`User faced [${value}] on main.joinRouteHandler. Error was:`, JSON.stringify(error));
    } else {
      logger.info(`User successfully went through main.joinRouteHandler with [${value}].`);
    }
    authenticatedRouteHandler(() => {
      // set defaults
      Session.set('isChatOpen', false);
      Session.set('idChatOpen', '');
      Session.set('isMeetingEnded', false);
      Session.set('isPollOpen', false);
      Session.get('breakoutRoomIsOpen', false);
      render(<Base />, document.getElementById('app'));
    });
  });
});
