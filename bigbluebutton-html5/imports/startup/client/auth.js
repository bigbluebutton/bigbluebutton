import Auth from '/imports/ui/services/auth';
import SessionStorage from '/imports/ui/services/storage/session';
import { setCustomLogoUrl } from '/imports/ui/components/user-list/service';
import { log } from '/imports/ui/services/api';
import deviceInfo from '/imports/utils/deviceInfo';

// disconnected and trying to open a new connection
const STATUS_CONNECTING = 'connecting';
const METADATA_KEY = 'metadata';

export function joinRouteHandler(nextState, replace, callback) {
  const { sessionToken } = nextState.location.query;

  if (!nextState || !sessionToken) {
    replace({ pathname: '/error/404' });
    callback();
  }

  // use enter api to get params for the client
  const url = `/bigbluebutton/api/enter?sessionToken=${sessionToken}`;

  fetch(url, { credentials: 'same-origin' })
    .then(response => response.json())
    .then(({ response }) => {
      const {
        returncode, meetingID, internalUserID, authToken, logoutUrl, customLogoURL, metadata,
      } = response;

      if (returncode === 'FAILED') {
        replace({ pathname: '/error/404' });
        callback();
      }

      setCustomLogoUrl(customLogoURL);
      const metakeys = metadata.length
        ? metadata.reduce((acc, meta) => {
          const key = Object.keys(meta).shift();

          const handledHTML5Parameters = [
            'html5autoswaplayout', 'html5autosharewebcam', 'html5hidepresentation',
          ];
          if (handledHTML5Parameters.indexOf(key) === -1) {
            return acc;
          }

          /* this reducer transforms array of objects in a single object and
           forces the metadata a be boolean value */
          let value = meta[key];
          try {
            value = JSON.parse(meta[key]);
          } catch (e) {
            log('error', `Caught: ${e.message}`);
          }
          return { ...acc, [key]: value };
        }) : {};
      SessionStorage.setItem(METADATA_KEY, metakeys);

      Auth.set(meetingID, internalUserID, authToken, logoutUrl, sessionToken);

      const path = deviceInfo.type().isPhone ? '/' : '/users';

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
