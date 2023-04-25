import browserInfo from '/imports/utils/browserInfo';
import deviceInfo from '/imports/utils/deviceInfo';
import {
  hasWorkingTurnServer,
  relayPreflightCheck,
} from '/imports/utils/fetchStunTurnServers';
import Auth from '/imports/ui/services/auth';

const FORCE_RELAY_ON_FF = Meteor.settings.public.media.forceRelayOnFirefox;
const FORCE_RELAY = Meteor.settings.public.media.forceRelay;

/*
 * Whether TURN/relay usage is configured to work around Firefox's lack of
 * support for regular nomination when dealing with ICE-litee peers (e.g.:
 * mediasoup). See: https://bugzilla.mozilla.org/show_bug.cgi?id=1034964
 *
 * iOS endpoints are ignored from the trigger because _all_ iOS browsers
 * are either native WebKit or WKWebView based (so they shouldn't be affected)
 */
const isForceRelayConfigured = () => {
  const { isFirefox } = browserInfo;
  const { isIos } = deviceInfo;

  return FORCE_RELAY || (isFirefox && !isIos) && FORCE_RELAY_ON_FF;
};

const shouldForceRelay = () => {
  const { isFirefox } = browserInfo;
  const { isIos } = deviceInfo;

  return isForceRelayConfigured() && hasWorkingTurnServer();
};

/*
 * This function is used to check if the TURN server is working properly.
 * It is called when the user joins a room, and if it fails, FORCE_RELAY* flags
 * will be ineffective.
 *
 * The check runs relayPreflightCheck at most three times (less if it works)
 * and the result will be cached for the duration of the session.
 *
 * The default state of a relay server is false, so if shouldForceRelay is called
 * before the check is run, it will return false.
 *
 */
const runRelayPreflightCheck = () => {
  if (!isForceRelayConfigured() || hasWorkingTurnServer()) {
    return Promise.resolve();
  }

  const timedPreflightCheck = (retries) => {
    if (retries === 0) {
      return Promise.reject(new Error('Relay candidates not generated in time'));
    }

    return relayPreflightCheck(Auth.sessionToken)
      .catch((error) => timedPreflightCheck(retries - 1));
  };

  return timedPreflightCheck(3);
};

export {
  shouldForceRelay,
  runRelayPreflightCheck,
};
