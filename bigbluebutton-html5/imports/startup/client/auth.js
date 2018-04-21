import Auth from '/imports/ui/services/auth';
import { setCustomLogoUrl } from '/imports/ui/components/user-list/service';
import { log } from '/imports/ui/services/api';
import deviceType from '/imports/utils/deviceType';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';

export function joinRouteHandler(nextState, replace, callback) {
  const { sessionToken } = nextState.location.query;

  if (!nextState || !sessionToken) {
    replace({ pathname: '/error/404' });
    callback();
  }

  // use enter api to get params for the client
  const url = `/bigbluebutton/api/enter?sessionToken=${sessionToken}`;

  fetch(url)
    .then(response => response.json())
    .then((data) => {
      const {
        meetingID, internalUserID, authToken, logoutUrl, customLogoURL,
      } = data.response;

      setCustomLogoUrl(customLogoURL);

      Auth.set(meetingID, internalUserID, authToken, logoutUrl, sessionToken);

      const path = deviceType().isPhone ? '/' : '/users';

      replace({ pathname: path });

      callback();
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
