this.Router.configure({
  layoutTemplate: 'layout',
});

this.Router.map(function () {
  // this is how we handle login attempts
  this.route('main', {
    path: '/html5client/:meeting_id/:user_id/:auth_token',
    where: 'client',
    onBeforeAction() {
      let applyNewSessionVars, authToken, meetingId, userId;
      meetingId = this.params.meeting_id;
      userId = this.params.user_id;
      authToken = this.params.auth_token;
      setInSession('loginUrl', this.originalUrl);

      // catch if any of the user's meeting data is invalid
      if ((authToken == null) || (meetingId == null) || (userId == null)) {
        // if their data is invalid, redirect the user to the logout page
        document.location = getInSession('logoutURL');
      } else {
        Meteor.call('validateAuthToken', meetingId, userId, authToken);
        applyNewSessionVars = function () {
          setInSession('authToken', authToken);
          setInSession('meetingId', meetingId);
          setInSession('userId', userId);
          return Router.go('/html5client');
        };

        clearSessionVar(applyNewSessionVars);
      }

      return this.next();
    },
  });

  // the user successfully logged in
  this.route('signedin', {
    path: '/html5client',
    where: 'client',
    action() {
      let authToken, meetingId, onErrorFunction, userId;
      meetingId = getInSession('meetingId');
      userId = getInSession('userId');
      authToken = getInSession('authToken');
      onErrorFunction = function (error, result) {
        console.log('ONERRORFUNCTION');

        //make sure the user is not let through
        Meteor.call('userLogout', meetingId, userId, authToken);

        clearSessionVar();

        // Attempt to log back in
        if (error == null) {
          window.location.href = getInSession('loginUrl') || getInSession('logoutURL');
        }
      };

      Meteor.subscribe('chat', meetingId, userId, authToken, {
        onError: onErrorFunction,
        onReady: (_this => {
          return function () {
            return Meteor.subscribe('shapes', meetingId, {
              onReady: function () {
                return Meteor.subscribe('slides', meetingId, {
                  onReady: function () {
                    return Meteor.subscribe('meetings', meetingId, {
                      onReady: function () {
                        return Meteor.subscribe('presentations', meetingId, {
                          onReady: function () {
                            return Meteor.subscribe('users', meetingId, userId, authToken, {
                              onError: onErrorFunction,
                              onReady: function () {
                                return Meteor.subscribe('whiteboard-clean-status', meetingId, {
                                  onReady: function () {
                                    return Meteor.subscribe('bbb_poll', meetingId, userId, authToken, {
                                      onReady: function () {
                                        return Meteor.subscribe('bbb_cursor', meetingId, {
                                          onReady: function () {
                                            let a, handleLogourUrlError;

                                            // done subscribing, start rendering the client and set default settings
                                            _this.render('main');
                                            onLoadComplete();
                                            handleLogourUrlError = function () {
                                              alert('Error: could not find the logoutURL');
                                              setInSession('logoutURL', document.location.hostname);
                                            };

                                            // obtain the logoutURL
                                            a = $.ajax({
                                              dataType: 'json',
                                              url: '/bigbluebutton/api/enter',
                                            });
                                            a.done(data => {
                                              if (data.response.logoutURL != null) { // for a meeting with 0 users
                                                setInSession('logoutURL', data.response.logoutURL);
                                              } else {
                                                if (data.response.logoutUrl != null) { // for a running meeting
                                                  setInSession('logoutURL', data.response.logoutUrl);
                                                } else {
                                                  return handleLogourUrlError();
                                                }
                                              }
                                            });
                                            return a.fail((data, textStatus, errorThrown) => {
                                              return handleLogourUrlError();
                                            });
                                          },
                                        });
                                      },
                                    });
                                  },
                                });
                              },
                            });
                          },
                        });
                      },
                    });
                  },
                });
              },
            });
          };
        })(this),
      });
      return this.render('loading');
    },
  });

  // endpoint - is the html5client running (ready to handle a user)
  this.route('meteorEndpoint', {
    path: '/check',
    where: 'server',
    action() {
      this.response.writeHead(200, {
        'Content-Type': 'application/json',
      });

      // reply that the html5client is running
      this.response.end(JSON.stringify({
        html5clientStatus: 'running',
      }));
    },
  });
});
