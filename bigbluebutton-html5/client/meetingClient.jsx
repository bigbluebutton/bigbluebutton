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

import React, { useContext, useEffect } from 'react';
import logger from '/imports/startup/client/logger';
import '/imports/ui/services/mobile-app';
import Base from '/imports/startup/client/base';
import ContextProviders from '/imports/ui/components/context-providers/component';
// The adapter import is "unused" as far as static code is concerned, but it
// needs to here to override global prototypes. So: don't remove it - prlanzarin 25 Apr 2022
import adapter from 'webrtc-adapter';

import { LoadingContext } from '/imports/ui/components/common/loading-screen/loading-screen-HOC/component';
import IntlAdapter from '/imports/startup/client/intlAdapter';
import PresenceAdapter from '../imports/ui/components/presence-adapter/component';
import CustomUsersSettings from '/imports/ui/components/join-handler/custom-users-settings/component';
import createUseSubscription from '/imports/ui/core/hooks/createUseSubscription';
import PLUGIN_CONFIGURATION_QUERY from '/imports/ui/components/plugins-engine/query';

// eslint-disable-next-line import/prefer-default-export
const Startup = () => {
  const loadingContextInfo = useContext(LoadingContext);
  useEffect(() => {
    loadingContextInfo.setLoading(false);
  }, []);
  // Logs all uncaught exceptions to the client logger
  window.addEventListener('error', (e) => {
    let message = e.message || e.error.toString();

    // Chrome will add on "Uncaught" to the start of the message for some reason. This
    // will strip that so the errors can hopefully be grouped better.
    if (message) message = message.replace(/^Uncaught/, '').trim();

    let stack = e.error?.stack || '';

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

  const { data: pluginConfig } = createUseSubscription(
    PLUGIN_CONFIGURATION_QUERY,
  )((obj) => obj);
  return (
    <ContextProviders>
      <PresenceAdapter>
        <IntlAdapter>
          <Base pluginConfig={pluginConfig} />
        </IntlAdapter>
      </PresenceAdapter>
    </ContextProviders>
  );
};

export default Startup;
