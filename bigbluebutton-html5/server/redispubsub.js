const bind = function (fn, me) { return function () { return fn.apply(me, arguments); }; }, indexOf = [].indexOf || function (item) {
  for (let i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1;
};

Meteor.methods({
  // Construct and send a message to bbb-web to validate the user
  validateAuthToken(meetingId, userId, authToken) {
    let message;
    Meteor.log.info('sending a validate_auth_token with', {
      userid: userId,
      authToken: authToken,
      meetingid: meetingId,
    });
    message = {
      payload: {
        auth_token: authToken,
        userid: userId,
        meeting_id: meetingId,
      },
      header: {
        timestamp: new Date().getTime(),
        reply_to: `${meetingId}/${userId}`,
        name: 'validate_auth_token',
      },
    };
    if ((authToken != null) && (userId != null) && (meetingId != null)) {
      createDummyUser(meetingId, userId, authToken);
      return publish(Meteor.config.redis.channels.toBBBApps.meeting, message);
    } else {
      return Meteor.log.info('did not have enough information to send a validate_auth_token message');
    }
  },
});

Meteor.RedisPubSub = (function () {
  class RedisPubSub {
    constructor(callback) {
      this._addToQueue = bind(this._addToQueue, this);
      this._onSubscribe = bind(this._onSubscribe, this);
      Meteor.log.info('constructor RedisPubSub');
      this.pubClient = redis.createClient();
      this.subClient = redis.createClient();
      Meteor.log.info(`Subscribing message on channel: ${Meteor.config.redis.channels.fromBBBApps}`);
      this.subClient.on('psubscribe', Meteor.bindEnvironment(this._onSubscribe));
      this.subClient.on('pmessage', Meteor.bindEnvironment(this._addToQueue));
      this.subClient.psubscribe(Meteor.config.redis.channels.fromBBBApps);
      callback(this);
    }

    _onSubscribe(channel, count) {
      let message;
      Meteor.log.info(`Subscribed to ${channel}`);

      //grab data about all active meetings on the server
      message = {
        header: {
          name: 'get_all_meetings_request',
        },
        payload: {} // I need this, otherwise bbb-apps won't recognize the message
      };
      return publish(Meteor.config.redis.channels.toBBBApps.meeting, message);
    }

    _addToQueue(pattern, channel, jsonMsg) {
      let eventName, message, messagesWeIgnore;
      message = JSON.parse(jsonMsg);
      eventName = message.header.name;
      messagesWeIgnore = [
        'BbbPubSubPongMessage',
        'bbb_apps_is_alive_message',
        'broadcast_layout_message',];
      if (indexOf.call(messagesWeIgnore, eventName) < 0) {
        console.log(`Q ${eventName} ${Meteor.myQueue.total()}`);
        return Meteor.myQueue.add({
          pattern: pattern,
          channel: channel,
          jsonMsg: jsonMsg,
        });
      }
    }
  }

  return RedisPubSub;
})();

// --------------------------------------------------------------------------------------------
// Private methods on server
// --------------------------------------------------------------------------------------------

// message should be an object
this.publish = function (channel, message) {
  Meteor.log.info(`redis outgoing message  ${message.header.name}`, {
    channel: channel,
    message: message,
  });
  if (Meteor.redisPubSub != null) {
    return Meteor.redisPubSub.pubClient.publish(channel, JSON.stringify(message), (err, res) => {
      if (err) {
        return Meteor.log.info('error', {
          error: err,
        });
      }
    });
  } else {
    return Meteor.log.info('ERROR!! Meteor.redisPubSub was undefined');
  }
};

const handleVoiceEvent = function(arg) {
  let _voiceUser, meetingId;
  meetingId = arg.payload.meeting_id;
  _voiceUser = payload.user.voiceUser;
  voiceUserObj = {
    web_userid: _voiceUser.web_userid,
    listen_only: arg.payload.listen_only,
    talking: _voiceUser.talking,
    joined: _voiceUser.joined,
    locked: _voiceUser.locked,
    muted: _voiceUser.muted,
  };
  return updateVoiceUser(meetingId, voiceUserObj, arg.callback);
};

const handleLockEvent = function(arg) {
  let userId, isLocked;
  userId = arg.payload.userid;
  isLocked = arg.payload.locked;
  setUserLockedStatus(meetingId, userId, isLocked);
  return arg.callback();
};

const handleEndOfMeeting = function(arg) {
  let meetingId;
  meetingId = arg.payload.meeting_id;
  Meteor.log.info(`DESTROYING MEETING ${meetingId}`);
  return removeMeetingFromCollection(meetingId, arg.callback);
};


const handleChatEvent = function (arg) {
  let messageObject, meetingId;
  messageObject = arg.payload.message;
  meetingId = arg.payload.meeting_id;

  // use current_time instead of message.from_time so that the chats from Flash and HTML5 have uniform times
  messageObject.from_time = arg.header.current_time;
  addChatToCollection(meetingId, messageObject);
  return arg.callback();
};


// To ensure that we process the redis json event messages serially we use a
// callback. This callback is to be called when the Meteor collection is
// updated with the information coming in the payload of the json message. The
// callback signalizes to the queue that we are done processing the current
// message in the queue and are ready to move on to the next one. If we do not
// use the callback mechanism we may encounter a race condition situation
// due to not following the order of events coming through the redis pubsub.
// for example: a user_left event reaching the collection before a user_joined
// for the same user.
registerHandlers = function (emitter) {
  console.log("REGISTER HANDLERS", emitter);

  emitter.on('get_users_reply', function (arg) {
    if (arg.payload.requester_id === 'nodeJSapp') {
      let users, processUser, meetingId;
      console.log("get_users_reply handling");
      users = arg.payload.users;
      meetingId = arg.payload.meeting_id;

      //TODO make the serialization be split per meeting. This will allow us to
      // use N threads vs 1 and we'll take advantage of Mongo's concurrency tricks

      // Processing the users recursively with a callback to notify us,
      // ensuring that we update the users collection serially
      processUser = function () {
        let user;
        user = users.pop();
        if (user != null) {
          user.timeOfJoining = arg.header.current_time;
          if (user.emoji_status !== 'none' && typeof user.emoji_status === 'string') {
            user.set_emoji_time = new Date();
            return userJoined(meetingId, user, processUser);
          } else {
            return userJoined(meetingId, user, processUser);
          }
        } else {
          return arg.callback(); // all meeting arrays (if any) have been processed
        }
      };

      return processUser();
    }
    else {
      arg.callback();
    }
  });

  emitter.on('meeting_created_message', function(arg) {
    meetingName = arg.payload.name;
    intendedForRecording = arg.payload.recorded;
    voiceConf = arg.payload.voice_conf;
    duration = arg.payload.duration;
    meetingId = arg.payload.meeting_id;
    return addMeetingToCollection(meetingId, meetingName, intendedForRecording, voiceConf, duration, arg.callback);
  });

  emitter.on('get_all_meetings_reply', function(arg) {
    let listOfMeetings, processMeeting;
    Meteor.log.info("Let's store some data for the running meetings so that when an HTML5 client joins everything is ready!");
    Meteor.log.info(JSON.stringify(arg.payload));
    listOfMeetings = arg.payload.meetings;

    // Processing the meetings recursively with a callback to notify us,
    // ensuring that we update the meeting collection serially
    processMeeting = function () {
      let meeting;
      meeting = listOfMeetings.pop();
      if (meeting != null) {
        return addMeetingToCollection(meeting.meetingID, meeting.meetingName, meeting.recorded, meeting.voiceBridge, meeting.duration, processMeeting);
      } else {
        return arg.callback(); // all meeting arrays (if any) have been processed
      }
    };
    return processMeeting();
  });

  emitter.on('user_left_voice_message', function(arg) {
    handleVoiceEvent(arg);
  });

  emitter.on('user_joined_voice_message', function(arg) {
    handleVoiceEvent(arg);
  });

  emitter.on('user_voice_talking_message', function(arg) {
    handleVoiceEvent(arg);
  });

  emitter.on('user_voice_muted_message', function(arg) {
    handleVoiceEvent(arg);
  });

  emitter.on('user_listening_only', function(arg) {
    let voiceUserObj, meetingId;
    voiceUserObj = {
      web_userid: arg.payload.userid,
      listen_only: arg.payload.listen_only,
    };
    meetingId = arg.payload.meeting_id;
    return updateVoiceUser(meetingId, voiceUserObj, arg.callback);
  });

  emitter.on('user_left_message', function(arg) {
    if (arg.payload.user != null && arg.payload.user.userid != null && arg.payload.meeting_id != null) {
      let userId, meetingId;
      meetingId = arg.payload.meeting_id;
      userId = arg.payload.user.userid;
      return markUserOffline(meetingId, userId, arg.callback);
    } else {
      return arg.callback();
    }

  });

  emitter.on('validate_auth_token_reply', function(arg) {
    let userId, user, validStatus, payload, meetingId;
    meetingId = arg.payload.meeting_id;
    userId = arg.payload.userid;
    user = Meteor.Users.findOne({
      userId: userId,
      meetingId: meetingId,
    });
    validStatus = arg.payload.valid;

    // if the user already exists in the db
    if (user != null && user.clientType === 'HTML5') {
      //if the html5 client user was validated successfully, add a flag
      return Meteor.Users.update({
        userId: userId,
        meetingId: meetingId,
      }, {
        $set: {
          validated: validStatus,
        },
      }, (err, numChanged) => {
        let funct;
        if (numChanged.insertedId != null) {
          funct = function (cbk) {
            let user, val;
            user = Meteor.Users.findOne({
              userId: userId,
              meetingId: meetingId,
            });
            if (user != null) {
              val = user.validated;
            }

            Meteor.log.info(`user.validated for user ${userId} in meeting ${user.meetingId} just became ${val}`);
            return cbk();
          };

          return funct(arg.callback);
        } else {
          return arg.callback();
        }
      });
    } else {
      Meteor.log.info('a non-html5 user got validate_auth_token_reply.');
      return arg.callback();
    }
  });

  emitter.on('user_joined_message', function(arg) {
    let userObj, dbUser, meetingId, payload;
    meetingId = arg.payload.meeting_id;
    payload = arg.payload;
    userObj = payload.user;
    dbUser = Meteor.Users.findOne({
      userId: userObj.userid,
      meetingId: meetingId,
    });

    // On attempting reconnection of Flash clients (in voiceBridge) we receive
    // an extra user_joined_message. Ignore it as it will add an extra user
    // in the user list, creating discrepancy with the list in the Flash client
    if ((dbUser != null && dbUser.user != null && dbUser.user.connection_status === 'offline') && (payload.user != null && payload.user.phone_user)) {
      Meteor.log.error('offline AND phone user');
      return arg.callback(); //return without joining the user
    } else {
      if (dbUser != null && dbUser.clientType === 'HTML5') {
        let status;
        // typically html5 users will be in
        // the db [as a dummy user] before the joining message
        status = dbUser.validated;
        Meteor.log.info(`in user_joined_message the validStatus of the user was ${status}`);
        userObj.timeOfJoining = arg.header.current_time;
        return userJoined(meetingId, userObj, arg.callback);
      } else {
        return userJoined(meetingId, userObj, arg.callback);
      }
    }
  });

  // for now not handling these serially #TODO
  emitter.on('presenter_assigned_message', function(arg) {
    let newPresenterId, meetingId;
    meetingId = arg.payload.meeting_id;
    newPresenterId = arg.payload.new_presenter_id;
    if (newPresenterId != null) {
      // reset the previous presenter
      Meteor.Users.update({
        'user.presenter': true,
        meetingId: meetingId,
      }, {
        $set: {
          'user.presenter': false,
        },
      }, (err, numUpdated) => {
        return Meteor.log.info(` Updating old presenter numUpdated=${numUpdated}, err=${err}`);
      });

      // set the new presenter
      Meteor.Users.update({
        'user.userid': newPresenterId,
        meetingId: meetingId,
      }, {
        $set: {
          'user.presenter': true,
        },
      }, (err, numUpdated) => {
        return Meteor.log.info(` Updating new presenter numUpdated=${numUpdated}, err=${err}`);
      });
    }

    return arg.callback();
  });

  emitter.on('user_emoji_status_message', function(arg) {
    let userId, meetingId, emojiStatus;
    userId = arg.payload.userid;
    meetingId = arg.payload.meeting_id;
    emojiStatus = arg.payload.emoji_status;
    if (userId != null && meetingId != null) {
      let set_emoji_time;
      set_emoji_time = new Date();
      Meteor.Users.update({
        'user.userid': userId,
      }, {
        $set: {
          'user.set_emoji_time': set_emoji_time,
          'user.emoji_status': emojiStatus,
        },
      }, (err, numUpdated) => {
        return Meteor.log.info(` Updating emoji numUpdated=${numUpdated}, err=${err}`);
      });
    }
    return arg.callback();
  });

  emitter.on('user_locked_message', function (arg) {
    handleLockEvent(arg);
  });

  emitter.on('user_unlocked_message', function (arg) {
    handleLockEvent(arg);
  });

  emitter.on('meeting_ended_message', function (arg) {
    handleEndOfMeeting(arg);
  });

  emitter.on('meeting_destroyed_event', function (arg) {
    handleEndOfMeeting(arg);
  });

  emitter.on('end_and_kick_all_message', function (arg) {
    handleEndOfMeeting(arg);
  });

  emitter.on('disconnect_all_users_message', function (arg) {
    handleEndOfMeeting(arg);
  });

  emitter.on('get_chat_history_reply', function (arg) {
    if (arg.payload.requester_id === 'nodeJSapp') { //TODO extract this check
      let meetingId;
      meetingId = arg.payload.meeting_id;
      if (Meteor.Meetings.findOne({
          MeetingId: meetingId,
        }) == null) {
        let chatHistory, _chat_history_length, chatMessage;
        chatHistory = arg.payload.chat_history;
        _chat_history_length = chatHistory.length;
        for (i = 0; i < _chat_history_length; i++) {
          chatMessage = chatHistory[i];
          addChatToCollection(meetingId, chatMessage);
        }
      }
    }
    return arg.callback();
  });

  emitter.on('send_public_chat_message', function (arg) {
    handleChatEvent(arg);
  });

  emitter.on('send_private_chat_message', function (arg) {
    handleChatEvent(arg);
  });

  emitter.on('presentation_shared_message', function (arg) {
    let payload, meetingId;
    payload = arg.payload;
    meetingId = payload.meeting_id;
    if (payload.presentation != null && payload.presentation.id != null && meetingId != null) {
      let presentationId, pages, slide;
      presentationId = payload.presentation.id;

      // change the currently displayed presentation to presentation.current = false
      Meteor.Presentations.update({
        'presentation.current': true,
        meetingId: meetingId,
      }, {
        $set: {
          'presentation.current': false,
        },
      });

      //update(if already present) entirely the presentation with the fresh data
      removePresentationFromCollection(meetingId, presentationId);
      addPresentationToCollection(meetingId, payload.presentation);
      pages = payload.presentation.pages;
      for (j = 0; j < pages.length; j++) {
        slide = pages[j];
        addSlideToCollection(
          meetingId,
          presentationId,
          slide
        );
      }
    }
    return arg.callback();
  });

  emitter.on('get_presentation_info_reply', function (arg) {
    if (arg.payload.requester_id === 'nodeJSapp') {
      let presentations, payload, k, presentation, pages, page, l, meetingId, whiteboardId, replyTo, message;
      payload = arg.payload;
      meetingId = payload.meeting_id;
      presentations = payload.presentations;
      for (k = 0; k < payload.presentations.length; k++) {
        presentation = presentations[k];
        addPresentationToCollection(meetingId, presentation);
        pages = presentation.pages;
        for (l = 0; l < pages.length; l++) {
          page = pages[l];

          //add the slide to the collection
          addSlideToCollection(meetingId, presentation.id, page);

          //request for shapes
          whiteboardId = `${presentation.id}/${page.num}`;

          //Meteor.log.info "the whiteboard_id here is:" + whiteboardId

          replyTo = `${meetingId}/nodeJSapp`;
          message = {
            payload: {
              meeting_id: meetingId,
              requester_id: 'nodeJSapp',
              whiteboard_id: whiteboardId,
              reply_to: replyTo,
            },
            header: {
              timestamp: new Date().getTime(),
              name: 'request_whiteboard_annotation_history_request',
            },
          };
          if (whiteboardId != null && meetingId != null) {
            publish(Meteor.config.redis.channels.toBBBApps.whiteboard, message);
          } else {
            Meteor.log.info('did not have enough information to send a user_leaving_request');
          }
        }
      }

      return arg.callback();
    }
  });

  emitter.on('presentation_page_changed_message', function (arg) {
    let newSlide, meetingId;
    newSlide = arg.payload.page;
    meetingId = arg.payload.meeting_id;
    if (newSlide != null && newSlide.id != null && meetingId != null) {
      displayThisSlide(meetingId, newSlide.id, newSlide);
    }
    return arg.callback();
  });

  emitter.on('presentation_removed_message', function (arg) {
    let presentationId, meetingId;
    meetingId = arg.payload.meeting_id;
    presentationId = arg.payload.presentation_id;
    if (meetingId != null && presentationId != null) {
      removePresentationFromCollection(meetingId, presentationId);
    }
    return arg.callback();
  });

  emitter.on('get_whiteboard_shapes_reply', function (arg) {
    if (arg.payload.requester_id === 'nodeJSapp') {
      let meetingId, shapes, shapes_length, m, shape, whiteboardId;
      meetingId = arg.payload.meeting_id;
      // Create a whiteboard clean status or find one for the current meeting
      if (Meteor.WhiteboardCleanStatus.findOne({
          meetingId: meetingId,
        }) == null) {
        Meteor.WhiteboardCleanStatus.insert({
          meetingId: meetingId,
          in_progress: false,
        });
      }

      shapes = payload.shapes;
      shapes_length = shapes.length;
      for (m = 0; m < shapes_length; m++) {
        shape = shapes[m];
        whiteboardId = shape.wb_id;
        addShapeToCollection(meetingId, whiteboardId, shape);
      }

      return arg.callback();
    }
  });

  emitter.on('send_whiteboard_shape_message', function (arg) {
    let payload, shape, whiteboardId, meetingId;
    payload = arg.payload;
    meetingId = payload.meeting_id;
    //Meteor stringifies an array of JSONs (...shape.result) in this message
    //parsing the String and reassigning the value
    if (payload.shape.shape_type === 'poll_result' && typeof payload.shape.shape.result === 'string') {
      payload.shape.shape.result = JSON.parse(payload.shape.shape.result);
    }

    shape = payload.shape;
    if (shape != null && shape.wb_id != null) {
      whiteboardId = shape.wb_id;
    }

    addShapeToCollection(meetingId, whiteboardId, shape);
    return arg.callback();
  });

  emitter.on('presentation_cursor_updated_message', function (arg) {
    let cursor, meetingId;
    meetingId = arg.payload.meeting_id;
    cursor = {
      x: arg.payload.x_percent,
      y: arg.payload.y_percent,
    };

    // update the location of the cursor on the whiteboard
    updateCursorLocation(meetingId, cursor);
    return arg.callback();
  });

  emitter.on('whiteboard_cleared_message', function (arg) {
    let whiteboardId, meetingId;
    meetingId = arg.payload.meeting_id;
    whiteboardId = arg.payload.whiteboard_id;
    Meteor.WhiteboardCleanStatus.update({
      meetingId: meetingId,
    }, {
      $set: {
        in_progress: true,
      },
    });
    removeAllShapesFromSlide(meetingId, whiteboardId);
    return arg.callback();
  });

  emitter.on('undo_whiteboard_request', function (arg) {
    let whiteboardId, meetingId, shapeId;
    meetingId = arg.payload.meeting_id;
    whiteboardId = arg.payload.whiteboard_id;
    shapeId = arg.payload.shape_id;
    removeShapeFromSlide(meetingId, whiteboardId, shapeId);
    return arg.callback();
  });

  emitter.on('presentation_page_resized_message', function (arg) {
    let page, payload;
    payload = arg.payload;
    page = payload.page;
    if (page != null && page.id != null && page.height_ratio != null
      && page.width_ratio != null && page.x_offset != null && page.y_offset != null) {
      let slideId, heightRatio, widthRatio, xOffset, yOffset, presentationId, currentSlide;
      slideId = page.id;
      heightRatio = page.height_ratio;
      widthRatio = page.width_ratio;
      xOffset = page.x_offset;
      yOffset = page.y_offset;
      presentationId = slideId.split('/')[0];

      // In the case when we don't resize, but switch a slide, this message
      // follows a 'presentation_page_changed' and all these properties are already set.
      currentSlide = Meteor.Slides.findOne(
        { presentationId: presentationId,
          'slide.current': true, });
      if (currentSlide) {
        currentSlide = currentSlide.slide;
      }

      if (currentSlide != null && (currentSlide.height_ratio != heightRatio || currentSlide.width_ratio != widthRatio
        || currentSlide.x_offset != xOffset || currentSlide.y_offset != yOffset)) {
        Meteor.Slides.update({
          presentationId: presentationId,
          'slide.current': true,
        }, {
          $set: {
            'slide.height_ratio': heightRatio,
            'slide.width_ratio': widthRatio,
            'slide.x_offset': xOffset,
            'slide.y_offset': yOffset,
          },
        });
      }
    }

    return arg.callback();
  });

  emitter.on('recording_status_changed_message', function (arg) {
    let intendedForRecording, currentlyBeingRecorded, meetingId;
    intendedForRecording = arg.payload.recorded;
    currentlyBeingRecorded = arg.payload.recording;
    meetingId = arg.payload.meeting_id;

    Meteor.Meetings.update({
      meetingId: meetingId,
      intendedForRecording: intendedForRecording,
    }, {
      $set: {
        currentlyBeingRecorded: currentlyBeingRecorded,
      },
    });
    return arg.callback();
  });

  emitter.on('new_permission_settings', function (arg) {
    let meetingObject, meetingId, oldSettings, newSettings, payload;
    meetingId = arg.payload.meeting_id;
    payload = arg.payload;

    meetingObject = Meteor.Meetings.findOne({
      meetingId: meetingId,
    });
    if (meetingObject != null && payload != null) {
      oldSettings = meetingObject.roomLockSettings;
      newSettings = payload.permissions;

      // if the disableMic setting was turned on
      if (oldSettings != null && !oldSettings.disableMic && newSettings.disableMic) {
        handleLockingMic(meetingId, newSettings);
      }

      // substitute with the new lock settings
      Meteor.Meetings.update({
        meetingId: meetingId,
      }, {
        $set: {
          'roomLockSettings.disablePrivateChat': newSettings.disablePrivateChat,
          'roomLockSettings.disableCam': newSettings.disableCam,
          'roomLockSettings.disableMic': newSettings.disableMic,
          'roomLockSettings.lockOnJoin': newSettings.lockOnJoin,
          'roomLockSettings.lockedLayout': newSettings.lockedLayout,
          'roomLockSettings.disablePublicChat': newSettings.disablePublicChat,
          'roomLockSettings.lockOnJoinConfigurable': newSettings.lockOnJoinConfigurable,
        },
      });
    }

    return arg.callback();
  });

  emitter.on('poll_show_result_message', function (arg) {
    let payload, meetingId, poll_id;
    payload = arg.payload;
    meetingId = payload.meeting_id;
    if (payload != null && payload.poll != null && payload.poll.id != null && meetingId != null) {
      poll_id = payload.poll.id;
      clearPollCollection(meetingId, poll_id);
    }

    return arg.callback();
  });

  emitter.on('poll_started_message', function (arg) {
    let payload, meetingId, users;
    payload = arg.payload;
    meetingId = payload.meeting_id;

    if (payload != null && meetingId != null && payload.requester_id != null && payload.poll != null) {
      if (Meteor.Meetings.findOne({
          meetingId: meetingId,
        }) != null) {
        users = Meteor.Users.find({
          meetingId: meetingId,
        }, {
          fields: {
            'user.userid': 1,
            _id: 0,
          },
        }).fetch();
        addPollToCollection(
          payload.poll,
          payload.requester_id,
          users,
          meetingId
        );
      }
    }

    return arg.callback();
  });



  emitter.on('poll_stopped_message', function (arg) {
    let meetingId, payload, poll_id;
    payload = arg.payload;
    meetingId = payload.meeting_id;

    if (meetingId != null && payload != null && payload.poll_id != null) {
      poll_id = payload.poll_id;
      clearPollCollection(meetingId, poll_id);
    }
    return arg.callback();
  });

  emitter.on('user_voted_poll_message', function (arg) {
    let payload, meetingId, pollObj, requesterId;
    payload = arg.payload;
    meetingId = payload.meeting_id;
    if (payload != null && payload.poll != null && meetingId != null && payload.presenter_id != null) {
      pollObj = payload.poll;
      requesterId = payload.presenter_id;
      updatePollCollection(pollObj, meetingId, requesterId);
      return arg.callback();
    }
  });

  // TODO how to handle the rest of the messages - is there a wild card?
  // we need a way of calling the callback
  // emitter.on('' , function (arg) {
  //   console.log("**********************************" + arg.eventName);
  //   arg.callback();
  // });


  emitter.on('meeting_state_message' , function (arg) {
    // do nothing
    arg.callback();
  });

  emitter.on('user_registered_message' , function (arg) {
    // do nothing
    arg.callback();
  });
  //eject_voice_user_message
  
};

