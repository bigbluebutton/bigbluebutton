import { publish } from '/imports/startup/server/helpers';
import { Meetings, Chat } from '/imports/startup/collections';
import { Users } from '/imports/api/users/usersCollection';
import { logger } from '/imports/startup/server/logger';
import { redisConfig } from '/config';

// Only callable from server
// Received information from BBB-Apps that a user left
// Need to update the collection
// params: meetingid,  userid as defined in BBB-Apps
// callback
export function markUserOffline(meetingId, userId, callback) {
  // mark the user as offline. remove from the collection on meeting_end #TODO
  let user = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  
  if (user != null && user.clientType === 'HTML5') {
    logger.info(`marking html5 user [${userId}] as offline in meeting[${meetingId}]`);
    return Users.update({
      meetingId: meetingId,
      userId: userId,
    }, {
      $set: {
        'user.connection_status': 'offline',
        'user.voiceUser.talking': false,
        'user.voiceUser.joined': false,
        'user.voiceUser.muted': false,
        'user.time_of_joining': 0,
        'user.listenOnly': false, //TODO make this user: {}
      },
    }, (err, numChanged) => {
      let funct;
      if (err != null) {
        logger.error(`_unsucc update (mark as offline) of user ${user.user.name} ${userId} err=${JSON.stringify(err)}`);
        return callback();
      } else {
        funct = function (cbk) {
          logger.info(`_marking as offline html5 user ${user.user.name} ${userId}  numChanged=${numChanged}`);
          return cbk();
        };

        return funct(callback);
      }
    });
  } else {
    return Users.remove({
      meetingId: meetingId,
      userId: userId,
    }, (err, numDeletions) => {
      let funct;
      if (err != null) {
        logger.error(`_unsucc deletion of user ${user != null ? user.user.name : void 0} ${userId} err=${JSON.stringify(err)}`);
        return callback();
      } else {
        funct = function (cbk) {
          logger.info(`_deleting info for user ${user != null ? user.user.name : void 0} ${userId} numDeletions=${numDeletions}`);
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
export function requestUserLeaving(meetingId, userId) {
  let listenOnlyMessage, message, userObject, meetingObject, voiceConf;
  userObject = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  meetingObject = Meetings.findOne({
    meetingId: meetingId,
  });
  if (meetingObject != null) {
    voiceConf = meetingObject.voiceConf;
  }

  if ((userObject != null) && (voiceConf != null) && (userId != null) && (meetingId != null)) {
    let lOnly = false;
    if (userObject.hasOwnProperty('user') && userObject.user.hasOwnProperty('listenOnly')) {
      lOnly = userObject.user.listenOnly;
    }

    // end listenOnly audio for the departing user
    if (null != lOnly && lOnly) {
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
      publish(redisConfig.channels.toBBBApps.meeting, listenOnlyMessage);
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
    logger.info(`sending a user_leaving_request for ${meetingId}:${userId}`);
    return publish(redisConfig.channels.toBBBApps.users, message);
  } else {
    return logger.info('did not have enough information to send a user_leaving_request');
  }
};

//update a voiceUser - a helper method
export function updateVoiceUser(meetingId, voiceUserObject, callback) {
  let userObject;
  userObject = Users.findOne({
    userId: voiceUserObject.web_userid,
  });
  if (userObject != null) {
    if (voiceUserObject.talking != null) {
      Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.talking': voiceUserObject.talking,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [talking] err=${JSON.stringify(err)}`);
        }

        return callback();
      });
    } // talking
    if (voiceUserObject.joined != null) {
      Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.joined': voiceUserObject.joined,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(
            `_unsucc update of voiceUser ${voiceUserObject.web_userid} [joined] err=${JSON.stringify(err)}`
          );
        }

        return callback();
      });
    } // joined
    if (voiceUserObject.locked != null) {
      Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.locked': voiceUserObject.locked,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [locked] err=${JSON.stringify(err)}`);
        }

        return callback();
      });
    } // locked
    if (voiceUserObject.muted != null) {
      Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.voiceUser.muted': voiceUserObject.muted,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [muted] err=${JSON.stringify(err)}`);
        }

        return callback();
      });
    } // muted
    if (voiceUserObject.listen_only != null) {
      return Users.update({
        meetingId: meetingId,
        userId: voiceUserObject.web_userid,
      }, {
        $set: {
          'user.listenOnly': voiceUserObject.listen_only,
        },
      }, (err, numChanged) => {
        if (err != null) {
          logger.error(`_unsucc update of voiceUser ${voiceUserObject.web_userid} [listenOnly] err=${JSON.stringify(err)}`);
        }

        return callback();
      });
    } // listenOnly
  } else {
    logger.error('ERROR! did not find such voiceUser!');
    return callback();
  }
};

export function userJoined(meetingId, user, callback) {
  let userObject, userId, welcomeMessage, meetingObject;
  userId = user.userid;
  userObject = Users.findOne({
    userId: user.userid,
    meetingId: meetingId,
  });

  // the collection already contains an entry for this user
  // because the user is reconnecting OR
  // in the case of an html5 client user we added a dummy user on
  // register_user_message (to save authToken)
  if (userObject != null && userObject.authToken != null) {
    Users.update({
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
        logger.error(`_error ${err} when trying to insert user ${userId}`);
        return callback();
      } else {
        funct = function (cbk) {
          logger.info(`_(case1) UPDATING USER ${user.userid}, authToken= ${userObject.authToken}, locked=${user.locked}, username=${user.name}`);
          return cbk();
        };

        return funct(callback);
      }
    });
    meetingObject = Meetings.findOne({
      meetingId: meetingId,
    });
    if (meetingObject != null) {
      welcomeMessage = Meteor.config.defaultWelcomeMessage.replace(/%%CONFNAME%%/,
        meetingObject.meetingName);
    }

    welcomeMessage = welcomeMessage + Meteor.config.defaultWelcomeMessageFooter;

    // add the welcome message if it's not there already OR update time_of_joining
    return Chat.upsert({
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
        return logger.error(`_error ${err} when trying to insert welcome message for ${userId}`);
      } else {
        return logger.info(`_added/updated a system message in chat for user ${userId}`);
      }

      // note that we already called callback() when updating the user. Adding
      // the welcome message in the chat is not as vital and we can afford to
      // complete it when possible, without blocking the serial event messages processing
    });
  } else {
    // logger.info "NOTE: got user_joined_message #{user.name} #{user.userid}"
    return Users.upsert({
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
          logger.info(
            `_joining user (case2) userid=[${userId}]:${user.name}. Users.size is now ${Users.find({
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

export function createDummyUser(meetingId, userId, authToken) {
  if (Users.findOne({
    userId: userId,
    meetingId: meetingId,
    authToken: authToken,
  }) != null) {
    let msg = `html5 user userId:[${userId}] from [${meetingId}] tried to revalidate token`;
    return logger.info(msg);
  } else {
    return Users.insert({
      meetingId: meetingId,
      userId: userId,
      authToken: authToken,
      clientType: 'HTML5',
      validated: false //will be validated on validate_auth_token_reply
    }, (err, id) => {
      let res = Users.find({meetingId: meetingId,}).count();
      return logger.info(`_added a dummy html5 user userId=[${userId}] Users.size is now ${res}`);
    });
  }
};

// when new lock settings including disableMic are set,
// all viewers that are in the audio bridge with a mic should be muted and locked
export function handleLockingMic(meetingId, newSettings) {
  // send mute requests for the viewer users joined with mic
  let i, results, userObject;
  userObjects = Users.find({
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
    results.push(Meteor.call('muteUser', meetingId, userObject.userId, userObject.userId,
      userObject.authToken, true)); //true for muted
  }

  return results;
};

// change the locked status of a user (lock settings)
export function setUserLockedStatus(meetingId, userId, isLocked) {
  let userObject;
  userObject = Users.findOne({
    meetingId: meetingId,
    userId: userId,
  });
  if (userObject != null) {
    Users.update({
      userId: userId,
      meetingId: meetingId,
    }, {
      $set: {
        'user.locked': isLocked,
      },
    }, (err, numChanged) => {
      if (err != null) {
        return logger.error(`_error ${err} while updating user ${userId} with lock settings`);
      } else {
        return logger.info(`_setting user locked status for:[${userId}] from [${meetingId}] locked=${isLocked}`);
      }
    });

    // if the user is sharing audio, he should be muted upon locking involving disableMic
    if (userObject.user.role === 'VIEWER' && !userObject.user.listenOnly &&
      userObject.user.voiceUser.joined && !userObject.user.voiceUser.muted && isLocked) {
      return Meteor.call('muteUser', meetingId, userObject.userId, userObject.userId,
        userObject.authToken, true); //true for muted
    }
  } else {
    let tempMsg = '(unsuccessful-no such user) setting user locked status for userid:';
    return logger.error(`${tempMsg}[${userId}] from [${meetingId}] locked=${isLocked}`);
  }
};

// called on server start and on meeting end
export function clearUsersCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Users.remove({
      meetingId: meetingId,
    }, err => {
      if (err != null) {
        return logger.error(`_error ${JSON.stringify(err)} while removing users from ${meetingId}`);
      } else {
        return logger.info(`_cleared Users Collection (meetingId: ${meetingId})!`);
      }
    });
  } else {
    return Users.remove({}, err => {
      if (err != null) {
        return logger.error(`_error ${JSON.stringify(err)} while removing users from all meetings`);
      } else {
        return logger.info('_cleared Users Collection (all meetings)!');
      }
    });
  }
};
