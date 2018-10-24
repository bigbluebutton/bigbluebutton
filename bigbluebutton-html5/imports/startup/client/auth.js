import Auth from '/imports/ui/services/auth';
import { setCustomLogoUrl } from '/imports/ui/components/user-list/service';
import { log, makeCall } from '/imports/ui/services/api';
import deviceInfo from '/imports/utils/deviceInfo';
import logger from '/imports/startup/client/logger';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';

export function joinRouteHandler(nextState, replace, callback) {
  const { sessionToken } = nextState.location.query;

  if (!nextState || !sessionToken) {
    replace({ pathname: '/error/404' });
    callback();
  }

  // Old credentials stored in memory were being used when joining a new meeting
  Auth.clearCredentials();

  // use enter api to get params for the client
  const url = `/bigbluebutton/api/enter?sessionToken=${sessionToken}`;

  fetch(url, { credentials: 'same-origin' })
    .then(response => response.json())
    .then(({ response }) => {
      const {
        returncode, meetingID, internalUserID, authToken, logoutUrl, customLogoURL,
        externUserID, fullname, confname, customdata,
      } = response;

      if (returncode === 'FAILED') {
        replace({ pathname: '/error/404' });
        callback();
      }

      setCustomLogoUrl(customLogoURL);

      if (customdata.length) {
        makeCall('addUserSettings', meetingID, internalUserID, customdata);
      }

      Auth.set(
        meetingID, internalUserID, authToken, logoutUrl,
        sessionToken, fullname, externUserID, confname,
      );

      const path = deviceInfo.type().isPhone ? '/' : '/users';
      const userInfo = window.navigator;

      // Browser information is sent once on startup
      // Sent here instead of Meteor.startup, as the
      // user might not be validiated by then, thus user's data
      // would not be sent with this information
      const clientInfo = {
        language: userInfo.language,
        userAgent: userInfo.userAgent,
        screenSize: { width: window.screen.width, height: window.screen.height },
        windowSize: { width: window.innerWidth, height: window.innerHeight },
        bbbVersion: Meteor.settings.public.app.bbbServerVersion,
        location: window.location.href,
      };

      replace({ pathname: path });

      logger.info(clientInfo);

      return callback();
    });
}

export function logoutRouteHandler() {
  Auth.logout()
    .then((logoutURL = window.location.origin) => {
      const protocolPattern = /^((http|https):\/\/)/;

      window.location.href =
        protocolPattern.test(logoutURL) ?
          logoutURL :
          `http://${logoutURL}`;
    });
}

/**
 * Check if should revalidate the auth
 * @param {Object} status
 * @param {String} lastStatus
 */
export function shouldAuthenticate(status, lastStatus) {
  return lastStatus != null && lastStatus === STATUS_CONNECTING && status.connected;
}

/**
 * Check if the isn't the first connection try, preventing to authenticate on login.
 * @param {Object} status
 * @param {string} lastStatus
 */
export function updateStatus(status, lastStatus) {
  return status.retryCount > 0 && lastStatus !== STATUS_CONNECTING ? status.status : lastStatus;
}

function _addReconnectObservable() {
  let lastStatus = null;

  Tracker.autorun(() => {
    lastStatus = updateStatus(Meteor.status(), lastStatus);

    if (shouldAuthenticate(Meteor.status(), lastStatus)) {
      Auth.authenticate(true);
      lastStatus = Meteor.status().status;
    }
  });
}

export function authenticatedRouteHandler(nextState, replace, callback) {
  if (Auth.loggedIn) {
    callback();
  }

  _addReconnectObservable();

  Auth.authenticate()
    .then(callback)
    .catch((reason) => {
      log('error', reason);
      replace({ pathname: `/error/${reason.error}` });
      callback();
    });
}
