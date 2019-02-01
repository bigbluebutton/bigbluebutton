/* eslint no-unused-vars: 0 */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import logger from '/imports/startup/client/logger';
import Base from '/imports/startup/client/base';
import JoinHandler from '/imports/ui/components/join-handler/component';
import AuthenticatedHandler from '/imports/ui/components/authenticated-handler/component';

Meteor.startup(() => {
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
    logger.error({ logCode: 'startup_error' }, message);
  });

  // TODO make this a Promise
  render(
    <JoinHandler >
      <AuthenticatedHandler>
        <Base />
      </AuthenticatedHandler>
    </JoinHandler>,
    document.getElementById('app'),
  );
});
