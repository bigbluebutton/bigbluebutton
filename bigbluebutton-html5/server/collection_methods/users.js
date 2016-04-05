// --------------------------------------------------------------------------------------------
// Public methods on server
// All these method must first authenticate the user before it calls the private function counterpart below
// which sends the request to bbbApps. If the method is modifying the media the current user is sharing,
// you should perform the request before sending the request to bbbApps. This allows the user request to be performed
// immediately, since they do not require permission for things such as muting themsevles.
// --------------------------------------------------------------------------------------------
Meteor.methods({
  // meetingId: the meetingId of the meeting the user is in
  // toSetUserId: the userId of the user joining
  // requesterUserId: the userId of the requester
  // requesterToken: the authToken of the requester
  listenOnlyRequestToggle(meetingId, userId, authToken, isJoining) {
    let message, userObject, username, voiceConf, meetingObject;
    meetingObject = Meteor.Meetings.findOne({
      meetingId: meetingId,
    });
    if (meetingObject != null) {
      voiceConf = meetingObject.voiceConf;
    }

    userObject = Meteor.Users.findOne({
      meetingId: meetingId,
      userId: userId,
    });
    if (userObject != null) {
      username = userObject.user.name;
    }

    if (isJoining) {
      if (isAllowedTo('joinListenOnly', meetingId, userId, authToken)) {
        message = {
          payload: {
            userid: userId,
            meeting_id: meetingId,
            voice_conf: voiceConf,
            name: username,
          },
          header: {
            timestamp: new Date().getTime(),
            name: 'user_connected_to_global_audio',
            version: '0.0.1',
          },
        };
        Meteor.log.info(`publishing a user listenOnly toggleRequest ${isJoining} request for ${userId}`);
        publish(Meteor.config.redis.channels.toBBBApps.meeting, message);
      }
    } else {
      if (isAllowedTo('leaveListenOnly', meetingId, userId, authToken)) {
        message = {
          payload: {
            userid: userId,
            meeting_id: meetingId,
            voice_conf: voiceConf,
            name: username,
          },
          header: {
            timestamp: new Date().getTime(),
            name: 'user_disconnected_from_global_audio',
            version: '0.0.1',
          },
        };
        Meteor.log.info(`publishing a user listenOnly toggleRequest ${isJoining} request for ${userId}`);
        publish(Meteor.config.redis.channels.toBBBApps.meeting, message);
      }
    }
  },

  // meetingId: the meetingId of the meeting the user[s] is in
  // toMuteUserId: the userId of the user to be muted
  // requesterUserId: the userId of the requester
  // requesterToken: the authToken of the requester
  muteUser(meetingId, toMuteUserId, requesterUserId, requesterToken) {
    let action, message;
    action = function () {
      if (toMuteUserId === requesterUserId) {
        return 'muteSelf';
      } else {
        return 'muteOther';
      }
    };

    if (isAllowedTo(action(), meetingId, requesterUserId, requesterToken)) {
      message = {
        payload: {
          user_id: toMuteUserId,
          meeting_id: meetingId,
          mute: true,
          requester_id: requesterUserId,
        },
        header: {
          timestamp: new Date().getTime(),
          name: 'mute_user_request_message',
          version: '0.0.1',
        },
      };
      Meteor.log.info(`publishing a user mute request for ${toMuteUserId}`);
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
      updateVoiceUser(meetingId, {
        web_userid: toMuteUserId,
        talking: false,
        muted: true,
      });
    }
  },

  // meetingId: the meetingId of the meeting the user[s] is in
  // toMuteUserId: the userId of the user to be unmuted
  // requesterUserId: the userId of the requester
  // requesterToken: the authToken of the requester
  unmuteUser(meetingId, toMuteUserId, requesterUserId, requesterToken) {
    let action, message;
    action = function () {
      if (toMuteUserId === requesterUserId) {
        return 'unmuteSelf';
      } else {
        return 'unmuteOther';
      }
    };

    if (isAllowedTo(action(), meetingId, requesterUserId, requesterToken)) {
      message = {
        payload: {
          user_id: toMuteUserId,
          meeting_id: meetingId,
          mute: false,
          requester_id: requesterUserId,
        },
        header: {
          timestamp: new Date().getTime(),
          name: 'mute_user_request_message',
          version: '0.0.1',
        },
      };
      Meteor.log.info(`publishing a user unmute request for ${toMuteUserId}`);
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
      updateVoiceUser(meetingId, {
        web_userid: toMuteUserId,
        talking: false,
        muted: false,
      });
    }
  },

  userSetEmoji(meetingId, toRaiseUserId, raisedByUserId, raisedByToken, status) {
    let message;
    if (isAllowedTo('setEmojiStatus', meetingId, raisedByUserId, raisedByToken)) {
      message = {
        payload: {
          emoji_status: status,
          userid: toRaiseUserId,
          meeting_id: meetingId,
        },
        header: {
          timestamp: new Date().getTime(),
          name: 'user_emoji_status_message',
          version: '0.0.1',
        },
      };

      // publish to pubsub
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
    }
  },

  // meetingId: the meeting where the user is
  // userId: the userid of the user logging out
  // authToken: the authToken of the user
  userLogout(meetingId, userId, authToken) {
    if (isAllowedTo('logoutSelf', meetingId, userId, authToken)) {
      Meteor.log.info(`a user is logging out from ${meetingId}:${userId}`);
      return requestUserLeaving(meetingId, userId);
    }
  },

  //meetingId: the meeting where the user is
  //toKickUserId: the userid of the user to kick
  //requesterUserId: the userid of the user that wants to kick
  //authToken: the authToken of the user that wants to kick
  kickUser(meetingId, toKickUserId, requesterUserId, authToken) {
    let message;
    if (isAllowedTo('kickUser', meetingId, requesterUserId, authToken)) {
      message = {
        payload: {
          userid: toKickUserId,
          ejected_by: requesterUserId,
          meeting_id: meetingId,
        },
        header: {
          name: 'eject_user_from_meeting_request_message',
        },
      };
      return publish(Meteor.config.redis.channels.toBBBApps.users, message);
    }
  },

  //meetingId: the meeting where the user is
  //newPresenterId: the userid of the new presenter
  //requesterSetPresenter: the userid of the user that wants to change the presenter
  //newPresenterName: user name of the new presenter
  //authToken: the authToken of the user that wants to kick
  setUserPresenter(
    meetingId,
    newPresenterId,
    requesterSetPresenter,
    newPresenterName,
    authToken) {
    let message;
    if (isAllowedTo('setPresenter', meetingId, requesterSetPresenter, authToken)) {
      message = {
        payload: {
          new_presenter_id: newPresenterId,
          new_presenter_name: newPresenterName,
          meeting_id: meetingId,
          assigned_by: requesterSetPresenter,
        },
        header: {
          name: 'assign_presenter_request_message',
        },
      };
    }

    return publish(Meteor.config.redis.channels.toBBBApps.users, message);
  },
});

// --------------------------------------------------------------------------------------------
// Private methods on server
// --------------------------------------------------------------------------------------------

// Only callable from server
// Received information from BBB-Apps that a user left
// Need to update the collection
// params: meetingid, userid as defined in BBB-Apps
// callback
this.markUserOffline = function (meetingId, userId, callback) {
  // mark the user as offline. remove from the collection on meeting_end #TODO
  let user;
  user = Meteor.Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  if (user != null && user.clientType === 'HTML5') {
    Meteor.log.info(`marking html5 user [${userId}] as offline in meeting[${meetingId}]`);
    return Meteor.Users.update({
      meetingId: meetingId,
      userId: userId,
    }, {
      $set: {
        'user.connection_status': 'offline',
        'user.voiceUser.talking': false,
        'user.voiceUser.joined': false,
        'user.voiceUser.muted': false,
        'user.time_of_joining': 0,
        'user.listenOnly': false,
      },
    }, (err, numChanged) => {
      let funct;
      if (err != null) {
        Meteor.log.error(`_unsucc update (mark as offline) of user ${user.user.name} ${userId} err=${JSON.stringify(err)}`);
        return callback();
      } else {
        funct = function (cbk) {
          Meteor.log.info(`_marking as offline html5 user ${user.user.name} ${userId}  numChanged=${numChanged}`);
          return cbk();
        };

        return funct(callback);
      }
    });
  } else {
    return Meteor.Users.remove({
      meetingId: meetingId,
      userId: userId,
    }, (err, numDeletions) => {
      let funct;
      if (err != null) {
        Meteor.log.error(`_unsucc deletion of user ${user != null ? user.user.name : void 0} ${userId} err=${JSON.stringify(err)}`);
        return callback();
      } else {
        funct = function (cbk) {
          Meteor.log.info(`_deleting info for user ${user != null ? user.user.name : void 0} ${userId} numDeletions=${numDeletions}`);
          return cbk();
        };

        return funct(callback);
      }
    });
  }
};

// Corresponds to a valid action on the HTML clientside
// After authorization, publish a user_leaving_request in redis
// params: meetingid, userid as defined in BBB-App
this.requestUserLeaving = function (meetingId, userId) {
  let listenOnlyMessage, message, userObject, meetingObject, voiceConf;
  userObject = Meteor.Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  meetingObject = Meteor.Meetings.findOne({
    meetingId: meetingId,
  });
  if (meetingObject != null) {
    voiceConf = meetingObject.voiceConf;
  }

  if ((userObject != null) && (voiceConf != null) && (userId != null) && (meetingId != null)) {

    // end listenOnly audio for the departing user
    if (userObject.user.listenOnly) {
      listenOnlyMessage = {
        payload: {
          userid: userId,
          meeting_id: meetingId,
          voice_conf: voiceConf,
          name: userObject.user.name,
        },
        header: {
          timestamp: new Date().getTime(),
          name: 'user_disconnected_from_global_audio',
        },
      };
      publish(Meteor.config.redis.channels.toBBBApps.meeting, listenOnlyMessage);
    }

    // remove user from meeting
    message = {
      payload: {
        meeting_id: meetingId,
        userid: userId,
      },
      header: {
        timestamp: new Date().getTime(),
        name: 'user_leaving_request',
      },
    };
    Meteor.log.info(`sending a user_leaving_request for ${meetingId}:${userId}`);
    return publish(Meteor.config.redis.channels.toBBBApps.users, message);
  } else {
    return Meteor.log.info('did not have enough information to send a user_leaving_request');
  }
};

//update a voiceUser - a helper method
this.updateVoiceUser = function (meetingId, voiceUserObject, callback) {
  let userObject;
  userObject = Meteor.Users.findOne({
    userId: voiceUserObject.web_userid,
  });
  if (userObject != null) {
    if (voiceUserObject.talking != null) {
      Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.talking': voiceUserObject.talking,
        },
      }, (err, numChanged) => {
        if (err != null) {
          Meteor.log.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [talking] err=${JSON.stringify(err)}`);
        }

        return callback();
      });
    } // talking
    if (voiceUserObject.joined != null) {
      Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.joined': voiceUserObject.joined,
        },
      }, (err, numChanged) => {
        if (err != null) {
          Meteor.log.error(
            `_unsucc update of voiceUser ${voiceUserObject.web_userid} [joined] err=${JSON.stringify(err)}`
          );
        }

        return callback();
      });
    } // joined
    if (voiceUserObject.locked != null) {
      Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.locked': voiceUserObject.locked,
        },
      }, (err, numChanged) => {
        if (err != null) {
          Meteor.log.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [locked] err=${JSON.stringify(err)}`);
        }

        return callback();
      });
    } // locked
    if (voiceUserObject.muted != null) {
      Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.muted': voiceUserObject.muted,
        },
      }, (err, numChanged) => {
        if (err != null) {
          Meteor.log.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [muted] err=${JSON.stringify(err)}`);
        }

        return callback();
      });
    } // muted
    if (voiceUserObject.listen_only != null) {
      return Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.listenOnly': voiceUserObject.listen_only,
        },
      }, (err, numChanged) => {
        if (err != null) {
          Meteor.log.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [listenOnly] err=${JSON.stringify(err)}`);
        }

        return callback();
      });
    } // listenOnly
  } else {
    Meteor.log.error('ERROR! did not find such voiceUser!');
    return callback();
  }
};

this.userJoined = function (meetingId, user, callback) {
  let userObject, userId, welcomeMessage, meetingObject;
  userId = user.userid;
  userObject = Meteor.Users.findOne({
    userId: user.userid,
    meetingId: meetingId,
  });

  // the collection already contains an entry for this user
  // because the user is reconnecting OR
  // in the case of an html5 client user we added a dummy user on
  // register_user_message (to save authToken)
  if (userObject != null && userObject.authToken != null) {
    Meteor.Users.update({
      userId: user.userid,
      meetingId: meetingId,
    }, {
      $set: {
        user: {
          userid: user.userid,
          presenter: user.presenter,
          name: user.name,
          _sort_name: user.name.toLowerCase(),
          phone_user: user.phone_user,
          set_emoji_time: user.set_emoji_time,
          emoji_status: user.emoji_status,
          has_stream: user.has_stream,
          role: user.role,
          listenOnly: user.listenOnly,
          extern_userid: user.extern_userid,
          locked: user.locked,
          time_of_joining: user.timeOfJoining,
          connection_status: 'online', // TODO consider other default value
          voiceUser: {
            web_userid: user.voiceUser.web_userid,
            callernum: user.voiceUser.callernum,
            userid: user.voiceUser.userid,
            talking: user.voiceUser.talking,
            joined: user.voiceUser.joined,
            callername: user.voiceUser.callername,
            locked: user.voiceUser.locked,
            muted: user.voiceUser.muted,
          },
          webcam_stream: user.webcam_stream,
        },
      },
    }, err => {
      let funct;
      if (err != null) {
        Meteor.log.error(`_error ${err} when trying to insert user ${userId}`);
        return callback();
      } else {
        funct = function (cbk) {
          Meteor.log.info(`_(case1) UPDATING USER ${user.userid}, authToken= ${userObject.authToken}, locked=${user.locked}, username=${user.name}`);
          return cbk();
        };

        return funct(callback);
      }
    });
    meetingObject = Meteor.Meetings.findOne({
      meetingId: meetingId,
    });
    if (meetingObject != null) {
      welcomeMessage = Meteor.config.defaultWelcomeMessage.replace(/%%CONFNAME%%/, meetingObject.meetingName);
    }

    welcomeMessage = welcomeMessage + Meteor.config.defaultWelcomeMessageFooter;

    // add the welcome message if it's not there already OR update time_of_joining
    return Meteor.Chat.upsert({
      meetingId: meetingId,
      userId: userId,
      'message.chat_type': 'SYSTEM_MESSAGE',
      'message.to_userid': userId,
    }, {
      meetingId: meetingId,
      userId: userId,
      message: {
        chat_type: 'SYSTEM_MESSAGE',
        message: welcomeMessage,
        from_color: '0x3399FF',
        to_userid: userId,
        from_userid: 'SYSTEM_MESSAGE',
        from_username: '',
        from_time: (user != null && user.timeOfJoining != null) ? user.timeOfJoining.toString() : void 0,
      },
    }, err => {
      if (err != null) {
        return Meteor.log.error(`_error ${err} when trying to insert welcome message for ${userId}`);
      } else {
        return Meteor.log.info(`_added/updated a system message in chat for user ${userId}`);
      }

      // note that we already called callback() when updating the user. Adding
      // the welcome message in the chat is not as vital and we can afford to
      // complete it when possible, without blocking the serial event messages processing
    });
  } else {
    // Meteor.log.info "NOTE: got user_joined_message #{user.name} #{user.userid}"
    return Meteor.Users.upsert({
      meetingId: meetingId,
      userId: userId,
    }, {
      meetingId: meetingId,
      userId: userId,
      user: {
        userid: user.userid,
        presenter: user.presenter,
        name: user.name,
        _sort_name: user.name.toLowerCase(),
        phone_user: user.phone_user,
        emoji_status: user.emoji_status,
        set_emoji_time: user.set_emoji_time,
        has_stream: user.has_stream,
        role: user.role,
        listenOnly: user.listenOnly,
        extern_userid: user.extern_userid,
        locked: user.locked,
        time_of_joining: user.timeOfJoining,
        connection_status: '',
        voiceUser: {
          web_userid: user.voiceUser.web_userid,
          callernum: user.voiceUser.callernum,
          userid: user.voiceUser.userid,
          talking: user.voiceUser.talking,
          joined: user.voiceUser.joined,
          callername: user.voiceUser.callername,
          locked: user.voiceUser.locked,
          muted: user.voiceUser.muted,
        },
        webcam_stream: user.webcam_stream,
      },
    }, (err, numChanged) => {
      let funct;
      if (numChanged.insertedId != null) {
        funct = function (cbk) {
          Meteor.log.info(
            `_joining user (case2) userid=[${userId}]:${user.name}. Users.size is now ${Meteor.Users.find({
              meetingId: meetingId,
            }).count()}`
                      );
          return cbk();
        };

        return funct(callback);
      } else {
        return callback();
      }
    });
  }
};

this.createDummyUser = function (meetingId, userId, authToken) {
  if (Meteor.Users.findOne({
    userId: userId,
    meetingId: meetingId,
    authToken: authToken,
  }) != null) {
    return Meteor.log.info(`html5 user userId:[${userId}] from [${meetingId}] tried to revalidate token`);
  } else {
    return Meteor.Users.insert({
      meetingId: meetingId,
      userId: userId,
      authToken: authToken,
      clientType: 'HTML5',
      validated: false //will be validated on validate_auth_token_reply
    }, (err, id) => {
      return Meteor.log.info(`_added a dummy html5 user with: userId=[${userId}] Users.size is now ${Meteor.Users.find({
  meetingId: meetingId,
}).count()}`);
    });
  }
};

// when new lock settings including disableMic are set,
// all viewers that are in the audio bridge with a mic should be muted and locked
this.handleLockingMic = function (meetingId, newSettings) {
  // send mute requests for the viewer users joined with mic
  let i, results, userObject;
  userObjects = Meteor.Users.find({
    meetingId: meetingId,
    'user.role': 'VIEWER',
    'user.listenOnly': false,
    'user.locked': true,
    'user.voiceUser.joined': true,
    'user.voiceUser.muted': false,
  }).fetch();

  _userObjects_length = userObjects.length;
  results = [];
  for (i = 0; i < _userObjects_length; i++) {
    userObject = userObjects[i];
    results.push(Meteor.call('muteUser', meetingId, userObject.userId, userObject.userId, userObject.authToken, true)); //true for muted
  }

  return results;
};

// change the locked status of a user (lock settings)
this.setUserLockedStatus = function (meetingId, userId, isLocked) {
  let userObject;
  userObject = Meteor.Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  if (userObject != null) {
    Meteor.Users.update({
      userId: userId,
      meetingId: meetingId,
    }, {
      $set: {
        'user.locked': isLocked,
      },
    }, (err, numChanged) => {
      if (err != null) {
        return Meteor.log.error(`_error ${err} while updating user ${userId} with lock settings`);
      } else {
        return Meteor.log.info(`_setting user locked status for userid:[${userId}] from [${meetingId}] locked=${isLocked}`);
      }
    });

    // if the user is sharing audio, he should be muted upon locking involving disableMic
    if (userObject.user.role === 'VIEWER' && !userObject.user.listenOnly && userObject.user.voiceUser.joined && !userObject.user.voiceUser.muted && isLocked) {
      return Meteor.call('muteUser', meetingId, userObject.userId, userObject.userId, userObject.authToken, true); //true for muted
    }
  } else {
    return Meteor.log.error(`(unsuccessful-no such user) setting user locked status for userid:[${userId}] from [${meetingId}] locked=${isLocked}`);
  }
};

// called on server start and on meeting end
this.clearUsersCollection = function (meetingId) {
  if (meetingId != null) {
    return Meteor.Users.remove({
      meetingId: meetingId,
    }, err => {
      if (err != null) {
        return Meteor.log.error(`_error ${JSON.stringify(err)} while removing users from meeting ${meetingId}`);
      } else {
        return Meteor.log.info(`_cleared Users Collection (meetingId: ${meetingId})!`);
      }
    });
  } else {
    return Meteor.Users.remove({}, err => {
      if (err != null) {
        return Meteor.log.error(`_error ${JSON.stringify(err)} while removing users from all meetings!`);
      } else {
        return Meteor.log.info('_cleared Users Collection (all meetings)!');
      }
    });
  }
};
