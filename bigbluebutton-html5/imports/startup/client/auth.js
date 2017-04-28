import Auth from '/imports/ui/services/auth';
import { logClient } from '/imports/ui/services/api';

export function joinRouteHandler(nextState, replace, callback) {
  if (!nextState || !nextState.params.authToken) {
    replace({ pathname: '/error/404' });
    callback();
  }

  const { meetingID, userID, authToken } = nextState.params;

  Auth.authenticate(meetingID, userID, authToken)
    .then(() => {
      replace({ pathname: '/' });
      callback();
    })
    .catch(reason => {
      logClient("info", { error: reason, method: "joinRouteHandler" });
      replace({ pathname: `/error/${reason.error}` });
      callback();
    });
};

export function logoutRouteHandler(nextState, replace, callback) {
  const { meetingID, userID, authToken } = nextState.params;

  Auth.logout()
    .then(logoutURL => {
      window.location = logoutURL || window.location.origin;
      callback();
    })
    .catch(reason => {
      replace({ pathname: '/error/500' });
      callback();
    });
};

export function authenticatedRouteHandler(nextState, replace, callback) {
  if (Auth.loggedIn) {
    callback();
  }

  const { meetingID, userID, authToken } = nextState.params;

  Auth.authenticate()
    .then(callback)
    .catch(reason => {
      logClient("info", { error: reason, method: "authenticatedRouteHandler" });
      replace({ pathname: `/error/${reason.error}` });
      callback();
    });
};
