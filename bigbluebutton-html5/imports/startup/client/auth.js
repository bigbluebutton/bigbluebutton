import Auth from '/imports/ui/services/auth';
import { setCustomLogoUrl } from '/imports/ui/components/user-list/service';
import { log, makeCall } from '/imports/ui/services/api';
import deviceInfo from '/imports/utils/deviceInfo';
import logger from '/imports/startup/client/logger';
import { Session } from 'meteor/session';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';

const setError = (errorCode) => {
  Session.set('hasError', true);
  Session.set('codeError', errorCode);
};

export function joinRouteHandler(callback) {
  const urlParams = new URLSearchParams(window.location.search);
  const sessionToken = urlParams.get('sessionToken');

  if (!sessionToken) {
    setError('404');
    callback('failed - no sessionToken', urlParams);
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
        setError('404');
        callback('failed during enter API call', response);
      } else {
        setCustomLogoUrl(customLogoURL);

        if (customdata.length) {
          makeCall('addUserSettings', meetingID, internalUserID, customdata);
        }

        Auth.set(
          meetingID, internalUserID, authToken, logoutUrl,
          sessionToken, fullname, externUserID, confname,
        );

        Session.set('isUserListOpen', deviceInfo.type().isPhone);
        const userInfo = window.navigator;

        // Browser information is sent once on startup
        // Sent here instead of Meteor.startup, as the
        // user might not be validated by then, thus user's data
        // would not be sent with this information
        const clientInfo = {
          language: userInfo.language,
          userAgent: userInfo.userAgent,
          screenSize: { width: window.screen.width, height: window.screen.height },
          windowSize: { width: window.innerWidth, height: window.innerHeight },
          bbbVersion: Meteor.settings.public.app.bbbServerVersion,
          location: window.location.href,
        };

        logger.info(clientInfo);

        callback('all is good', null);
      }
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

export function authenticatedRouteHandler(callback) {
  if (Auth.loggedIn) {
    callback();
  }

  _addReconnectObservable();

  Auth.authenticate()
    .then(callback)
    .catch((reason) => {
      log('error', reason);
      setError(reason.error);
      callback();
    });
}
