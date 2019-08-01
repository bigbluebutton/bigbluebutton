/* eslint no-unused-vars: 0 */
import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import logger from '/imports/startup/client/logger';
import Base from '/imports/startup/client/base';
import JoinHandler from '/imports/ui/components/join-handler/component';
import AuthenticatedHandler from '/imports/ui/components/authenticated-handler/component';
import Subscriptions from '/imports/ui/components/subscriptions/component';

Meteor.startup(() => {
  // Logs all uncaught exceptions to the client logger
  window.addEventListener('error', (e) => {
    let message = e.message || e.error.toString();

    // Chrome will add on "Uncaught" to the start of the message for some reason. This
    // will strip that so the errors can hopefully be grouped better.
    if (message) message = message.replace(/^Uncaught/, '').trim();

    let { stack } = e.error;

    // Checks if stack includes the message, if not add the two together.
    if (!stack.includes(message)) {
      stack = `${message}\n${stack}`;
    }
    logger.error({
      logCode: 'startup_error',
      extraInfo: {
        stackTrace: stack,
      },
    }, message);
  });

  // TODO make this a Promise
  render(
    <JoinHandler>
      <AuthenticatedHandler>
        <Subscriptions>
          <Base />
        </Subscriptions>
      </AuthenticatedHandler>
    </JoinHandler>,
    document.getElementById('app'),
  );
});
