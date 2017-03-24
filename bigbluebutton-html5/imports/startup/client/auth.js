import Auth from '/imports/ui/services/auth';

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
    .catch(() => {
      replace({ pathname: '/error/401' });
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
      console.error(reason);
      replace({ pathname: '/error/500' });
      callback();
    });
};

export function authenticatedRouteHandler(nextState, replace, callback) {
  if (Auth.loggedIn) {
    callback();
  }

  Auth.authenticate()
    .then(callback)
    .catch(reason => {
      console.error(reason);
      replace({ pathname: '/error/401' });
      callback();
    });
};
