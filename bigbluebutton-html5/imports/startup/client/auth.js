import Auth from '/imports/ui/services/auth';

export function joinRouteHandler(nextState, replace, callback) {
  if (nextState && nextState.params.authToken) {
    const { meetingID, userID, authToken } = nextState.params;
    Auth.authenticate(meetingID, userID, authToken)
      .then(() => {
        replace({ pathname: '/' });
        callback();
      })
      .catch(() => {
        replace({ pathname: '/error' });
        callback();
      });
  }
};

export function authenticatedRouteHandler(nextState, replace, callback) {
  if (Auth.loggedIn) {
    callback();
  }

  Auth.authenticate()
    .then(callback)
    .catch(() => {
      replace({ pathname: '/error' });
      callback();
    });
};
