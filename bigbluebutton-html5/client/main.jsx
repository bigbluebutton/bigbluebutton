/* eslint no-unused-vars: 0 */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import renderRoutes from '/imports/startup/client/routes';
import logger from '/imports/startup/client/logger';

Meteor.startup(() => {
  render(renderRoutes(), document.getElementById('app'));
  // Logs all uncaught exceptions to the client logger
  window.addEventListener('error', (e) => {
    const stack = e.error.stack;
    let message = e.error.toString();

    // Checks if stack includes the message, if not add the two together.
    (stack.includes(message)) ? message = stack : message += `\n${stack}`;
    logger.error(message);
  });
});
