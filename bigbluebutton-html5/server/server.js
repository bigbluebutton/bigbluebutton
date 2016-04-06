const indexOf = [].indexOf || function (item) {
  for (let i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1;
};

Meteor.startup(() => {
  Meteor.log.info('server start');

  //remove all data
  Meteor.WhiteboardCleanStatus.remove({});
  clearUsersCollection();
  clearChatCollection();
  clearMeetingsCollection();
  clearShapesCollection();
  clearSlidesCollection();
  clearPresentationsCollection();
  clearPollCollection();
  clearCursorCollection();

  // create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(function () {
    return Meteor.log.info('created pubsub');
  });

  Meteor.myQueue = new PowerQueue({
    // autoStart:true
    // isPaused: true
  });
  Meteor.myQueue.taskHandler = function (data, next, failures) {
    let eventName, parsedMsg;
    parsedMsg = JSON.parse(data.jsonMsg);
    if (parsedMsg != null) {
      eventName = parsedMsg.header.name;
    }

    if (failures > 0) {
      return Meteor.log.error(`got a failure on taskHandler ${eventName} ${failures}`);
    } else {
      return handleRedisMessage(data, () => {
        let length, lengthString;
        length = Meteor.myQueue.length();
        lengthString = function () {
          if (length > 0) {
            return `In the queue we have ${length} event(s) to process.`;
          } else {
            return '';
          }
        };

        Meteor.log.info(`in callback after handleRedisMessage ${eventName}. ${lengthString()}`);
        return next();
      });
    }
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
  return this.handleRedisMessage = function (data, callback) {
    let chatMessage, currentlyBeingRecorded, cursor, dbUser, duration, emojiStatus, eventName, heightRatio, i, intendedForRecording;
    let isLocked, j, k, l, listOfMeetings, m, meetingId, meetingName, meetingObject, message, messageObject, newPresenterId, newSettings;
    let newSlide, notLoggedEventTypes, oldSettings, page, pages, pollObj, poll_id, presentation, presentationId, processMeeting, processUser;
    let payload, chatHistory, _chat_history_length, presentations, shapes, shapes_length, replyTo, requesterId, set_emoji_time, shape, shapeId;
    let slide, slideId, status, user, userId, userObj, users, validStatus, voiceConf, voiceUserObj, _voiceUser, whiteboardId, widthRatio, xOffset, yOffset;
    message = JSON.parse(data.jsonMsg);
    payload = message.payload;
    if (payload != null) {
      meetingId = payload.meeting_id;
    }

    eventName = message.header.name;

    // Avoid cluttering the log with json messages carrying little or repetitive
    // information. Comment out a message type in the array to be able to see it
    // in the log upon restarting of the Meteor process.
    notLoggedEventTypes = [
      'keep_alive_reply',
      'page_resized_message',
      'presentation_page_resized_message',
      'presentation_cursor_updated_message',
      'get_presentation_info_reply',

      //"get_users_reply"
      'get_chat_history_reply',

      //"get_all_meetings_reply"
      'get_whiteboard_shapes_reply',
      'presentation_shared_message',
      'presentation_conversion_done_message',
      'presentation_conversion_progress_message',
      'presentation_page_generated_message',

      //"presentation_page_changed_message"
      'BbbPubSubPongMessage',
      'bbb_apps_is_alive_message',
      'user_voice_talking_message',
      'meeting_state_message',
      'get_recording_status_reply', ];

    if (message == null || message.header == null || payload == null) {
      Meteor.log.error('ERROR!! No header or payload');
      callback();
    }

    if (eventName, indexOf.call(notLoggedEventTypes, eventName) < 0) {
      Meteor.log.info(`redis incoming message  ${eventName}  `, {
        message: data.jsonMsg,
      });
    }

    // we currently disregard the pattern and channel
    if (message != null && message.header != null && payload != null) {
      if (eventName === 'meeting_created_message') {
        // Meteor.log.error JSON.stringify message
        meetingName = payload.name;
        intendedForRecording = payload.recorded;
        voiceConf = payload.voice_conf;
        duration = payload.duration;
        return addMeetingToCollection(meetingId, meetingName, intendedForRecording, voiceConf, duration, callback);

      // handle voice events
      } else if ((payload.user != null) && (eventName === 'user_left_voice_message' || eventName === 'user_joined_voice_message' || eventName === 'user_voice_talking_message' || eventName === 'user_voice_muted_message')) {
        _voiceUser = payload.user.voiceUser;
        voiceUserObj = {
          web_userid: _voiceUser.web_userid,
          listen_only: payload.listen_only,
          talking: _voiceUser.talking,
          joined: _voiceUser.joined,
          locked: _voiceUser.locked,
          muted: _voiceUser.muted,
        };
        return updateVoiceUser(meetingId, voiceUserObj, callback);
      } else if (eventName === 'user_listening_only') {
        voiceUserObj = {
          web_userid: payload.userid,
          listen_only: payload.listen_only,
        };
        return updateVoiceUser(meetingId, voiceUserObj, callback);
      } else if (eventName === 'get_all_meetings_reply') {
        Meteor.log.info("Let's store some data for the running meetings so that when an HTML5 client joins everything is ready!");
        Meteor.log.info(JSON.stringify(message));
        listOfMeetings = payload.meetings;

        // Processing the meetings recursively with a callback to notify us,
        // ensuring that we update the meeting collection serially
        processMeeting = function () {
          let meeting;
          meeting = listOfMeetings.pop();
          if (meeting != null) {
            return addMeetingToCollection(meeting.meetingID, meeting.meetingName, meeting.recorded, meeting.voiceBridge, meeting.duration, processMeeting);
          } else {
            return callback(); // all meeting arrays (if any) have been processed
          }
        };

        return processMeeting();
      } else if (eventName === 'user_joined_message') {
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
          return callback(); //return without joining the user
        } else {
          if (dbUser != null && dbUser.clientType === 'HTML5') {
            // typically html5 users will be in
            // the db [as a dummy user] before the joining message
            status = dbUser.validated;
            Meteor.log.info(`in user_joined_message the validStatus of the user was ${status}`);
            userObj.timeOfJoining = message.header.current_time;
            return userJoined(meetingId, userObj, callback);
          } else {
            return userJoined(meetingId, userObj, callback);
          }
        }

      // only process if requester is nodeJSapp means only process in the case when
      // we explicitly request the users
      } else if (eventName === 'get_users_reply' && payload.requester_id === 'nodeJSapp') {
        users = payload.users;

        //TODO make the serialization be split per meeting. This will allow us to
        // use N threads vs 1 and we'll take advantage of Mongo's concurrency tricks

        // Processing the users recursively with a callback to notify us,
        // ensuring that we update the users collection serially
        processUser = function () {
          let user;
          user = users.pop();
          if (user != null) {
            user.timeOfJoining = message.header.current_time;
            if (user.emoji_status !== 'none' && typeof user.emoji_status === 'string') {
              user.set_emoji_time = new Date();
              return userJoined(meetingId, user, processUser);
            } else {
              return userJoined(meetingId, user, processUser);
            }
          } else {
            return callback(); // all meeting arrays (if any) have been processed
          }
        };

        return processUser();
      } else if (eventName === 'validate_auth_token_reply') {
        userId = payload.userid;
        user = Meteor.Users.findOne({
          userId: userId,
          meetingId: meetingId,
        });
        validStatus = payload.valid;

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

              return funct(callback);
            } else {
              return callback();
            }
          });
        } else {
          Meteor.log.info('a non-html5 user got validate_auth_token_reply.');
          return callback();
        }
      } else if (eventName === 'user_left_message') {
        if (payload.user != null && payload.user.userid != null && meetingId != null) {
          userId = payload.user.userid;
          return markUserOffline(meetingId, userId, callback);
        } else {
          return callback(); //TODO check how to get these cases out and reuse code
        }

      // for now not handling this serially #TODO
      } else if (eventName === 'presenter_assigned_message') {
        newPresenterId = payload.new_presenter_id;
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

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'user_emoji_status_message') {
        userId = payload.userid;
        emojiStatus = payload.emoji_status;
        if (userId != null && meetingId != null) {
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

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'user_locked_message' || eventName === 'user_unlocked_message') {
        userId = payload.userid;
        isLocked = payload.locked;
        setUserLockedStatus(meetingId, userId, isLocked);
        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'meeting_ended_message' || eventName === 'meeting_destroyed_event' || eventName === 'end_and_kick_all_message' || eventName === 'disconnect_all_users_message') {
        Meteor.log.info(`DESTROYING MEETING ${meetingId}`);
        return removeMeetingFromCollection(meetingId, callback);

      // for now not handling this serially #TODO
      } else if (eventName === 'get_chat_history_reply' && payload.requester_id === 'nodeJSapp') {
        if (Meteor.Meetings.findOne({
          MeetingId: meetingId,
        }) == null) {
          chatHistory = payload.chat_history;
          _chat_history_length = chatHistory.length;
          for (i = 0; i < _chat_history_length; i++) {
            chatMessage = chatHistory[i];
            addChatToCollection(meetingId, chatMessage);
          }
        }

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'send_public_chat_message' || eventName === 'send_private_chat_message') {
        messageObject = payload.message;

        // use current_time instead of message.from_time so that the chats from Flash and HTML5 have uniform times
        messageObject.from_time = message.header.current_time;
        addChatToCollection(meetingId, messageObject);
        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'presentation_shared_message') {
        if (payload.presentation != null && payload.presentation.id != null && meetingId != null) {
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

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'get_presentation_info_reply' && payload.requester_id === 'nodeJSapp') {
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

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'presentation_page_changed_message') {
        newSlide = payload.page;
        if (newSlide != null && newSlide.id != null && meetingId != null) {
          displayThisSlide(meetingId, newSlide.id, newSlide);
        }

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'presentation_removed_message') {
        presentationId = payload.presentation_id;
        if (meetingId != null && presentationId != null) {
          removePresentationFromCollection(meetingId, presentationId);
        }

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'get_whiteboard_shapes_reply' && payload.requester_id === 'nodeJSapp') {
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

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'send_whiteboard_shape_message') {
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
        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'presentation_cursor_updated_message') {
        cursor = {
          x: payload.x_percent,
          y: payload.y_percent,
        };

        // update the location of the cursor on the whiteboard
        updateCursorLocation(meetingId, cursor);
        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'whiteboard_cleared_message') {
        whiteboardId = payload.whiteboard_id;
        Meteor.WhiteboardCleanStatus.update({
          meetingId: meetingId,
        }, {
          $set: {
            in_progress: true,
          },
        });
        removeAllShapesFromSlide(meetingId, whiteboardId);
        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'undo_whiteboard_request') {
        whiteboardId = payload.whiteboard_id;
        shapeId = payload.shape_id;
        removeShapeFromSlide(meetingId, whiteboardId, shapeId);
        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'presentation_page_resized_message') {
        page = payload.page;
        if (page != null && page.id != null && page.height_ratio != null && page.width_ratio != null && page.x_offset != null && page.y_offset != null) {
          slideId = page.id;
          heightRatio = page.height_ratio;
          widthRatio = page.width_ratio;
          xOffset = page.x_offset;
          yOffset = page.y_offset;
          presentationId = slideId.split('/')[0];

          /*In the case when we don't resize, but switch a slide, this message
          follows a 'presentation_page_changed' and all these properties are already set. */
          var currentSlide = Meteor.Slides.findOne(
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

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'recording_status_changed_message') {
        intendedForRecording = payload.recorded;
        currentlyBeingRecorded = payload.recording;
        Meteor.Meetings.update({
          meetingId: meetingId,
          intendedForRecording: intendedForRecording,
        }, {
          $set: {
            currentlyBeingRecorded: currentlyBeingRecorded,
          },
        });
        return callback();

      // --------------------------------------------------
      // lock settings ------------------------------------
      // for now not handling this serially #TODO
      } else if (eventName === 'eject_voice_user_message') {
        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'new_permission_settings') {
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

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'poll_started_message') {
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

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'poll_stopped_message') {
        if (meetingId != null && payload != null && payload.poll_id != null) {
          poll_id = payload.poll_id;
          clearPollCollection(meetingId, poll_id);
        }

        return callback();

      // for now not handling this serially #TODO
      } else if (eventName === 'user_voted_poll_message') {
        if (payload != null && payload.poll != null && meetingId != null && payload.presenter_id != null) {
          pollObj = payload.poll;
          requesterId = payload.presenter_id;
          updatePollCollection(pollObj, meetingId, requesterId);
          return callback();
        }

      // for now not handling this serially #TODO
      } else if (eventName === 'poll_show_result_message') {
        if (payload != null && payload.poll != null && payload.poll.id != null && meetingId != null) {
          poll_id = payload.poll.id;
          clearPollCollection(meetingId, poll_id);
        }

        return callback();
      } else { // keep moving in the queue
        if (indexOf.call(notLoggedEventTypes, eventName) < 0) {
          Meteor.log.info(`WARNING!!! THE JSON MESSAGE WAS NOT OF TYPE SUPPORTED BY THIS APPLICATION
            ${eventName}
            {JSON.stringify(message)}` );
        }

        return callback();
      }
    } else {
      return callback();
    }
  };
});
