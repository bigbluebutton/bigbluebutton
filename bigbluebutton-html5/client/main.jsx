/*
    BigBlueButton open source conferencing system - http://www.bigbluebutton.org/

    Copyright (c) 2020 BigBlueButton Inc. and by respective authors (see below).

    This program is free software; you can redistribute it and/or modify it under the
    terms of the GNU Lesser General Public License as published by the Free Software
    Foundation; either version 3.0 of the License, or (at your option) any later
    version.

    BigBlueButton is distributed in the hope that it will be useful, but WITHOUT ANY
    WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A
    PARTICULAR PURPOSE. See the GNU Lesser General Public License for more details.

    You should have received a copy of the GNU Lesser General Public License along
    with BigBlueButton; if not, see <http://www.gnu.org/licenses/>.
*/
/* eslint no-unused-vars: 0 */

import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import logger from '/imports/startup/client/logger';
import '/imports/ui/services/mobile-app';
import Base from '/imports/startup/client/base';
import JoinHandler from '/imports/ui/components/join-handler/component';
import AuthenticatedHandler from '/imports/ui/components/authenticated-handler/component';
import Subscriptions from '/imports/ui/components/subscriptions/component';
import IntlStartup from '/imports/startup/client/intl';
import ContextProviders from '/imports/ui/components/context-providers/component';
import ChatAdapter from '/imports/ui/components/components-data/chat-context/adapter';
import UsersAdapter from '/imports/ui/components/components-data/users-context/adapter';
import GroupChatAdapter from '/imports/ui/components/components-data/group-chat-context/adapter';
import { liveDataEventBrokerInitializer } from '/imports/ui/services/LiveDataEventBroker/LiveDataEventBroker';
// The adapter import is "unused" as far as static code is concerned, but it
// needs to here to override global prototypes. So: don't remove it - prlanzarin 25 Apr 2022
import adapter from 'webrtc-adapter';

import collectionMirrorInitializer from './collection-mirror-initializer';

import('/imports/api/audio/client/bridge/bridge-whitelist').catch(() => {
  // bridge loading
});

const { disableWebsocketFallback } = Meteor.settings.public.app;

if (disableWebsocketFallback) {
  Meteor.connection._stream._sockjsProtocolsWhitelist = function () { return ['websocket']; };

  Meteor.disconnect();
  Meteor.reconnect();
}

collectionMirrorInitializer();
liveDataEventBrokerInitializer();

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
    <ContextProviders>
      <>
        <JoinHandler>
          <AuthenticatedHandler>
            <Subscriptions>
              <IntlStartup>
                <Base />
              </IntlStartup>
            </Subscriptions>
          </AuthenticatedHandler>
        </JoinHandler>
        <UsersAdapter />
        <ChatAdapter />
        <GroupChatAdapter />
      </>
    </ContextProviders>,
    document.getElementById('app'),
  );
});
