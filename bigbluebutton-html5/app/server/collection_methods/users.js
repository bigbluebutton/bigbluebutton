Meteor.methods({
  listenOnlyRequestToggle(meetingId, userId, authToken, isJoining) {
    let message, ref, ref1, username, voiceConf;
    voiceConf = (ref = Meteor.Meetings.findOne({
      meetingId: meetingId
    })) != null ? ref.voiceConf : void 0;
    username = (ref1 = Meteor.Users.findOne({
      meetingId: meetingId,
      userId: userId
    })) != null ? ref1.user.name : void 0;
    if(isJoining) {
      if(isAllowedTo('joinListenOnly', meetingId, userId, authToken)) {
        message = {
          payload: {
            userid: userId,
            meeting_id: meetingId,
            voice_conf: voiceConf,
            name: username
          },
          header: {
            timestamp: new Date().getTime(),
            name: "user_connected_to_global_audio",
            version: "0.0.1"
          }
        };
        Meteor.log.info(`publishing a user listenOnly toggleRequest ${isJoining} request for ${userId}`);
        publish(Meteor.config.redis.channels.toBBBApps.meeting, message);
      }
    } else {
      if(isAllowedTo('leaveListenOnly', meetingId, userId, authToken)) {
        message = {
          payload: {
            userid: userId,
            meeting_id: meetingId,
            voice_conf: voiceConf,
            name: username
          },
          header: {
            timestamp: new Date().getTime(),
            name: "user_disconnected_from_global_audio",
            version: "0.0.1"
          }
        };
        Meteor.log.info(`publishing a user listenOnly toggleRequest ${isJoining} request for ${userId}`);
        publish(Meteor.config.redis.channels.toBBBApps.meeting, message);
      }
    }
  },
  muteUser(meetingId, toMuteUserId, requesterUserId, requesterToken) {
    let action, message;
    action = function() {
      if(toMuteUserId === requesterUserId) {
        return 'muteSelf';
      } else {
        return 'muteOther';
      }
    };
    if(isAllowedTo(action(), meetingId, requesterUserId, requesterToken)) {
      message = {
        payload: {
          user_id: toMuteUserId,
          meeting_id: meetingId,
          mute: true,
          requester_id: requesterUserId
        },
        header: {
          timestamp: new Date().getTime(),
          name: "mute_user_request_message",
          version: "0.0.1"
        }
      };
      Meteor.log.info(`publishing a user mute request for ${toMuteUserId}`);
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
      updateVoiceUser(meetingId, {
        'web_userid': toMuteUserId,
        talking: false,
        muted: true
      });
    }
  },
  unmuteUser(meetingId, toMuteUserId, requesterUserId, requesterToken) {
    let action, message;
    action = function() {
      if(toMuteUserId === requesterUserId) {
        return 'unmuteSelf';
      } else {
        return 'unmuteOther';
      }
    };
    if(isAllowedTo(action(), meetingId, requesterUserId, requesterToken)) {
      message = {
        payload: {
          user_id: toMuteUserId,
          meeting_id: meetingId,
          mute: false,
          requester_id: requesterUserId
        },
        header: {
          timestamp: new Date().getTime(),
          name: "mute_user_request_message",
          version: "0.0.1"
        }
      };
      Meteor.log.info(`publishing a user unmute request for ${toMuteUserId}`);
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
      updateVoiceUser(meetingId, {
        'web_userid': toMuteUserId,
        talking: false,
        muted: false
      });
    }
  },
  userSetEmoji(meetingId, toRaiseUserId, raisedByUserId, raisedByToken, status) {
    let message;
    if(isAllowedTo('setEmojiStatus', meetingId, raisedByUserId, raisedByToken)) {
      message = {
        payload: {
          emoji_status: status,
          userid: toRaiseUserId,
          meeting_id: meetingId
        },
        header: {
          timestamp: new Date().getTime(),
          name: "user_emoji_status_message",
          version: "0.0.1"
        }
      };
      publish(Meteor.config.redis.channels.toBBBApps.users, message);
    }
  },
  userLogout(meetingId, userId, authToken) {
    if(isAllowedTo('logoutSelf', meetingId, userId, authToken)) {
      Meteor.log.info(`a user is logging out from ${meetingId}:${userId}`);
      return requestUserLeaving(meetingId, userId);
    }
  },
  kickUser(meetingId, toKickUserId, requesterUserId, authToken) {
    let message;
    if(isAllowedTo('kickUser', meetingId, requesterUserId, authToken)) {
      message = {
        "payload": {
          "userid": toKickUserId,
          "ejected_by": requesterUserId,
          "meeting_id": meetingId
        },
        "header": {
          "name": "eject_user_from_meeting_request_message"
        }
      };
      return publish(Meteor.config.redis.channels.toBBBApps.users, message);
    }
  },
  setUserPresenter(
    meetingId,
    newPresenterId,
    requesterSetPresenter,
    newPresenterName,
    authToken) {
    let message;
    if(isAllowedTo('setPresenter', meetingId, requesterSetPresenter, authToken)) {
      message = {
        "payload": {
          "new_presenter_id": newPresenterId,
          "new_presenter_name": newPresenterName,
          "meeting_id": meetingId,
          "assigned_by": requesterSetPresenter
        },
        "header": {
          "name": "assign_presenter_request_message"
        }
      };
    }
    return publish(Meteor.config.redis.channels.toBBBApps.users, message);
  }
});

this.markUserOffline = function(meetingId, userId, callback) {
  let user;
  user = Meteor.Users.findOne({
    meetingId: meetingId,
    userId: userId
  });
  if((user != null ? user.clientType : void 0) === "HTML5") {
    Meteor.log.info(`marking html5 user [${userId}] as offline in meeting[${meetingId}]`);
    return Meteor.Users.update({
      meetingId: meetingId,
      userId: userId
    }, {
      $set: {
        'user.connection_status': 'offline',
        'voiceUser.talking': false,
        'voiceUser.joined': false,
        'voiceUser.muted': false,
        'user.time_of_joining': 0,
        'user.listenOnly': false
      }
    }, (err, numChanged) => {
      let funct;
      if(err != null) {
        Meteor.log.error(`_unsucc update (mark as offline) of user ${user != null ? user.user.name : void 0} ${userId} err=${JSON.stringify(err)}`);
        return callback();
      } else {
        funct = function(cbk) {
          Meteor.log.info(`_marking as offline html5 user ${user != null ? user.user.name : void 0} ${userId}  numChanged=${numChanged}`);
          return cbk();
        };
        return funct(callback);
      }
    });
  } else {
    return Meteor.Users.remove({
      meetingId: meetingId,
      userId: userId
    }, (err, numDeletions) => {
      let funct;
      if(err != null) {
        Meteor.log.error(`_unsucc deletion of user ${user != null ? user.user.name : void 0} ${userId} err=${JSON.stringify(err)}`);
        return callback();
      } else {
        funct = function(cbk) {
          Meteor.log.info(`_deleting info for user ${user != null ? user.user.name : void 0} ${userId} numDeletions=${numDeletions}`);
          return cbk();
        };
        return funct(callback);
      }
    });
  }
};

this.requestUserLeaving = function(meetingId, userId) {
  let listenOnlyMessage, message, ref, userObject, voiceConf;
  userObject = Meteor.Users.findOne({
    'meetingId': meetingId,
    'userId': userId
  });
  voiceConf = (ref = Meteor.Meetings.findOne({
    meetingId: meetingId
  })) != null ? ref.voiceConf : void 0;
  if((userObject != null) && (voiceConf != null) && (userId != null) && (meetingId != null)) {
    if(userObject.user.listenOnly) {
      listenOnlyMessage = {
        payload: {
          userid: userId,
          meeting_id: meetingId,
          voice_conf: voiceConf,
          name: userObject.user.name
        },
        header: {
          timestamp: new Date().getTime(),
          name: "user_disconnected_from_global_audio"
        }
      };
      publish(Meteor.config.redis.channels.toBBBApps.meeting, listenOnlyMessage);
    }
    message = {
      payload: {
        meeting_id: meetingId,
        userid: userId
      },
      header: {
        timestamp: new Date().getTime(),
        name: "user_leaving_request"
      }
    };
    Meteor.log.info(`sending a user_leaving_request for ${meetingId}:${userId}`);
    return publish(Meteor.config.redis.channels.toBBBApps.users, message);
  } else {
    return Meteor.log.info("did not have enough information to send a user_leaving_request");
  }
};

this.updateVoiceUser = function(meetingId, voiceUserObject, callback) {
  let u;
  u = Meteor.Users.findOne({
    userId: voiceUserObject.web_userid
  });
  if(u != null) {
    if(voiceUserObject.talking != null) {
      Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid
      }, {
        $set: {
          'user.voiceUser.talking': voiceUserObject.talking
        }
      }, (err, numChanged) => {
        if(err != null) {
          Meteor.log.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [talking] err=${JSON.stringify(err)}`);
        }
        return callback();
      });
    }
    if(voiceUserObject.joined != null) {
      Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid
      }, {
        $set: {
          'user.voiceUser.joined': voiceUserObject.joined
        }
      }, (err, numChanged) => {
        if (err != null) {
          Meteor.log.error(
            `_unsucc update of voiceUser ${voiceUserObject.web_userid} [joined] err=${JSON.stringify(err)}`
          );
        }
        return callback();
      });
    }
    if(voiceUserObject.locked != null) {
      Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid
      }, {
        $set: {
          'user.voiceUser.locked': voiceUserObject.locked
        }
      }, (err, numChanged) => {
        if(err != null) {
          Meteor.log.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [locked] err=${JSON.stringify(err)}`);
        }
        return callback();
      });
    }
    if(voiceUserObject.muted != null) {
      Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid
      }, {
        $set: {
          'user.voiceUser.muted': voiceUserObject.muted
        }
      }, (err, numChanged) => {
        if(err != null) {
          Meteor.log.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [muted] err=${JSON.stringify(err)}`);
        }
        return callback();
      });
    }
    if(voiceUserObject.listen_only != null) {
      return Meteor.Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid
      }, {
        $set: {
          'user.listenOnly': voiceUserObject.listen_only
        }
      }, (err, numChanged) => {
        if(err != null) {
          Meteor.log.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [listenOnly] err=${JSON.stringify(err)}`);
        }
        return callback();
      });
    }
  } else {
    Meteor.log.error("ERROR! did not find such voiceUser!");
    return callback();
  }
};

this.userJoined = function(meetingId, user, callback) {
  let ref, ref1, u, userId, welcomeMessage;
  userId = user.userid;
  u = Meteor.Users.findOne({
    userId: user.userid,
    meetingId: meetingId
  });
  if((u != null) && (u.authToken != null)) {
    Meteor.Users.update({
      userId: user.userid,
      meetingId: meetingId
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
          connection_status: "online",
          voiceUser: {
            web_userid: user.voiceUser.web_userid,
            callernum: user.voiceUser.callernum,
            userid: user.voiceUser.userid,
            talking: user.voiceUser.talking,
            joined: user.voiceUser.joined,
            callername: user.voiceUser.callername,
            locked: user.voiceUser.locked,
            muted: user.voiceUser.muted
          },
          webcam_stream: user.webcam_stream
        }
      }
    }, err => {
      let funct;
      if(err != null) {
        Meteor.log.error(`_error ${err} when trying to insert user ${userId}`);
        return callback();
      } else {
        funct = function(cbk) {
          Meteor.log.info(`_(case1) UPDATING USER ${user.userid}, authToken= ${u.authToken}, locked=${user.locked}, username=${user.name}`);
          return cbk();
        };
        return funct(callback);
      }
    });
    welcomeMessage = Meteor.config.defaultWelcomeMessage.replace(/%%CONFNAME%%/, (ref = Meteor.Meetings.findOne({
      meetingId: meetingId
    })) != null ? ref.meetingName : void 0);
    welcomeMessage = welcomeMessage + Meteor.config.defaultWelcomeMessageFooter;
    return Meteor.Chat.upsert({
      meetingId: meetingId,
      userId: userId,
      'message.chat_type': 'SYSTEM_MESSAGE',
      'message.to_userid': userId
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
        from_time: (ref1 = user.timeOfJoining) != null ? ref1.toString() : void 0
      }
    }, err => {
      if(err != null) {
        return Meteor.log.error(`_error ${err} when trying to insert welcome message for ${userId}`);
      } else {
        return Meteor.log.info(`_added/updated a system message in chat for user ${userId}`);
      }
    });
  } else {
    return Meteor.Users.upsert({
      meetingId: meetingId,
      userId: userId
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
        connection_status: "",
        voiceUser: {
          web_userid: user.voiceUser.web_userid,
          callernum: user.voiceUser.callernum,
          userid: user.voiceUser.userid,
          talking: user.voiceUser.talking,
          joined: user.voiceUser.joined,
          callername: user.voiceUser.callername,
          locked: user.voiceUser.locked,
          muted: user.voiceUser.muted
        },
        webcam_stream: user.webcam_stream
      }
    }, (err, numChanged) => {
      let funct;
      if(numChanged.insertedId != null) {
        funct = function(cbk) {
          Meteor.log.info(
            `_joining user (case2) userid=[${userId}]:${user.name}. Users.size is now ${Meteor.Users.find({
meetingId: meetingId
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

this.createDummyUser = function(meetingId, userId, authToken) {
  if(Meteor.Users.findOne({
    userId: userId,
    meetingId: meetingId,
    authToken: authToken
  }) != null) {
    return Meteor.log.info(`html5 user userId:[${userId}] from [${meetingId}] tried to revalidate token`);
  } else {
    return Meteor.Users.insert({
      meetingId: meetingId,
      userId: userId,
      authToken: authToken,
      clientType: "HTML5",
      validated: false
    }, (err, id) => {
      return Meteor.log.info(`_added a dummy html5 user with: userId=[${userId}] Users.size is now ${Meteor.Users.find({
  meetingId: meetingId
}).count()}`);
    });
  }
};

this.handleLockingMic = function(meetingId, newSettings) {
  let i, len, ref, ref1, results, u;
  ref1 = (ref = Meteor.Users.find({
    meetingId: meetingId,
    'user.role': 'VIEWER',
    'user.listenOnly': false,
    'user.locked': true,
    'user.voiceUser.joined': true,
    'user.voiceUser.muted': false
  })) != null ? ref.fetch() : void 0;
  results = [];
  for(i = 0, len = ref1.length; i < len; i++) {
    u = ref1[i];
    results.push(Meteor.call('muteUser', meetingId, u.userId, u.userId, u.authToken, true));
  }
  return results;
};

this.setUserLockedStatus = function(meetingId, userId, isLocked) {
  let u;
  u = Meteor.Users.findOne({
    meetingId: meetingId,
    userId: userId
  });
  if(u != null) {
    Meteor.Users.update({
      userId: userId,
      meetingId: meetingId
    }, {
      $set: {
        'user.locked': isLocked
      }
    }, (err, numChanged) => {
      if(err != null) {
        return Meteor.log.error(`_error ${err} while updating user ${userId} with lock settings`);
      } else {
        return Meteor.log.info(`_setting user locked status for userid:[${userId}] from [${meetingId}] locked=${isLocked}`);
      }
    });
    if(u.user.role === 'VIEWER' && !u.user.listenOnly && u.user.voiceUser.joined && !u.user.voiceUser.muted && isLocked) {
      return Meteor.call('muteUser', meetingId, u.userId, u.userId, u.authToken, true);
    }
  } else {
    return Meteor.log.error(`(unsuccessful-no such user) setting user locked status for userid:[${userId}] from [${meetingId}] locked=${isLocked}`);
  }
};

this.clearUsersCollection = function(meetingId) {
  if(meetingId != null) {
    return Meteor.Users.remove({
      meetingId: meetingId
    }, err => {
      if(err != null) {
        return Meteor.log.error(`_error ${JSON.stringify(err)} while removing users from meeting ${meetingId}`);
      } else {
        return Meteor.log.info(`_cleared Users Collection (meetingId: ${meetingId})!`);
      }
    });
  } else {
    return Meteor.Users.remove({}, err => {
      if(err != null) {
        return Meteor.log.error(`_error ${JSON.stringify(err)} while removing users from all meetings!`);
      } else {
        return Meteor.log.info("_cleared Users Collection (all meetings)!");
      }
    });
  }
};
