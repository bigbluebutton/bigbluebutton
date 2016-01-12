this.Router.configure({
  layoutTemplate: 'layout'
});

this.Router.map(function() {
  this.route("main", {
    path: "/html5client/:meeting_id/:user_id/:auth_token",
    where: "client",
    onBeforeAction() {
      let applyNewSessionVars, authToken, meetingId, userId;
      meetingId = this.params.meeting_id;
      userId = this.params.user_id;
      authToken = this.params.auth_token;
      setInSession("loginUrl", this.originalUrl);
      if ((authToken == null) || (meetingId == null) || (userId == null)) {
        document.location = getInSession('logoutURL');
      } else {
        Meteor.call("validateAuthToken", meetingId, userId, authToken);
        applyNewSessionVars = function() {
          setInSession("authToken", authToken);
          setInSession("meetingId", meetingId);
          setInSession("userId", userId);
          return Router.go('/html5client');
        };
        clearSessionVar(applyNewSessionVars);
      }
      return this.next();
    }
  });
  this.route("signedin", {
    path: "/html5client",
    where: "client",
    action() {
      let authToken, meetingId, onErrorFunction, userId;
      meetingId = getInSession("meetingId");
      userId = getInSession("userId");
      authToken = getInSession("authToken");
      onErrorFunction = function(error, result) {
        console.log("ONERRORFUNCTION");
        Meteor.call("userLogout", meetingId, userId, authToken);
        clearSessionVar();
        if (error == null) {
          window.location.href = getInSession('loginUrl') || getInSession('logoutURL');
        }
      };
      Meteor.subscribe('chat', meetingId, userId, authToken, {
        onError: onErrorFunction,
        onReady: (_this => {
          return function() {
            return Meteor.subscribe('shapes', meetingId, {
              onReady: function() {
                return Meteor.subscribe('slides', meetingId, {
                  onReady: function() {
                    return Meteor.subscribe('meetings', meetingId, {
                      onReady: function() {
                        return Meteor.subscribe('presentations', meetingId, {
                          onReady: function() {
                            return Meteor.subscribe('users', meetingId, userId, authToken, {
                              onError: onErrorFunction,
                              onReady: function() {
                                return Meteor.subscribe('whiteboard-clean-status', meetingId, {
                                  onReady: function() {
                                    return Meteor.subscribe('bbb_poll', meetingId, userId, authToken, {
                                      onReady: function() {
                                        return Meteor.subscribe('bbb_cursor', meetingId, {
                                          onReady: function() {
                                            let a, handleLogourUrlError;
                                            _this.render('main');
                                            onLoadComplete();
                                            handleLogourUrlError = function() {
                                              alert("Error: could not find the logoutURL");
                                              setInSession("logoutURL", document.location.hostname);
                                            };
                                            a = $.ajax({
                                              dataType: 'json',
                                              url: '/bigbluebutton/api/enter'
                                            });
                                            a.done(data => {
                                              if (data.response.logoutURL != null) {
                                                setInSession("logoutURL", data.response.logoutURL);
                                              } else {
                                                if (data.response.logoutUrl != null) {
                                                  setInSession("logoutURL", data.response.logoutUrl);
                                                } else {
                                                  return handleLogourUrlError();
                                                }
                                              }
                                            });
                                            return a.fail((data, textStatus, errorThrown) => {
                                              return handleLogourUrlError();
                                            });
                                          }
                                        });
                                      }
                                    });
                                  }
                                });
                              }
                            });
                          }
                        });
                      }
                    });
                  }
                });
              }
            });
          };
        })(this)
      });
      return this.render('loading');
    }
  });
  this.route('meteorEndpoint', {
    path: '/check',
    where: 'server',
    action() {
      this.response.writeHead(200, {
        'Content-Type': 'application/json'
      });
      this.response.end(JSON.stringify({
        "html5clientStatus": "running"
      }));
    }
  });
});
