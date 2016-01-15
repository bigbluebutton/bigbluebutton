const indexOf = [].indexOf || function(item) { for(let i = 0, l = this.length; i < l; i++) { if(i in this && this[i] === item) return i; } return -1; };

Meteor.startup(() => {
  Meteor.log.info("server start");

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
  Meteor.redisPubSub = new Meteor.RedisPubSub(function() {
    return Meteor.log.info("created pubsub");
  });
  Meteor.myQueue = new PowerQueue({
    // autoStart:true
    // isPaused: true
  });
  Meteor.myQueue.taskHandler = function(data, next, failures) {
    let eventName, ref;
    eventName = (ref = JSON.parse(data.jsonMsg)) != null ? ref.header.name : void 0;
    if(failures > 0) {
      return Meteor.log.error(`got a failure on taskHandler ${eventName} ${failures}`);
    } else {
      return handleRedisMessage(data, () => {
        let length, lengthString;
        length = Meteor.myQueue.length();
        lengthString = function() {
          if(length > 0) {
            return `In the queue we have ${length} event(s) to process.`;
          } else {
            return "";
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
  return this.handleRedisMessage = function(data, callback) {
    let chatMessage, currentlyBeingRecorded, cursor, dbUser, duration, emojiStatus, eventName, heightRatio, i, intendedForRecording, isLocked, j, k, l, len, len1, len2, len3, len4, listOfMeetings, m, meetingId, meetingName, message, messageObject, newPresenterId, newSettings, newSlide, notLoggedEventTypes, oldSettings, page, pollObj, poll_id, presentation, presentationId, processMeeting, processUser, ref, ref1, ref10, ref11, ref12, ref13, ref14, ref15, ref16, ref17, ref18, ref19, ref2, ref20, ref21, ref3, ref4, ref5, ref6, ref7, ref8, ref9, replyTo, requesterId, set_emoji_time, shape, shapeId, slide, slideId, status, user, userId, userObj, users, validStatus, voiceConf, voiceUserObj, whiteboardId, widthRatio, xOffset, yOffset;
    message = JSON.parse(data.jsonMsg);
    // correlationId = message.payload?.reply_to or message.header?.reply_to
    meetingId = (ref = message.payload) != null ? ref.meeting_id : void 0;

    // Avoid cluttering the log with json messages carrying little or repetitive
    // information. Comment out a message type in the array to be able to see it
    // in the log upon restarting of the Meteor process.
    notLoggedEventTypes = [
      "keep_alive_reply",
      "page_resized_message",
      "presentation_page_resized_message",
      "presentation_cursor_updated_message",
      "get_presentation_info_reply",
      //"get_users_reply"
      "get_chat_history_reply",
      //"get_all_meetings_reply"
      "get_whiteboard_shapes_reply",
      "presentation_shared_message",
      "presentation_conversion_done_message",
      "presentation_conversion_progress_message",
      "presentation_page_generated_message",
      //"presentation_page_changed_message"
      "BbbPubSubPongMessage",
      "bbb_apps_is_alive_message",
      "user_voice_talking_message",
      "meeting_state_message",
      "get_recording_status_reply"];
    eventName = message.header.name;
    meetingId = (ref1 = message.payload) != null ? ref1.meeting_id : void 0;
    if(!(((message != null ? message.header : void 0) != null) && (message.payload != null))) {
      Meteor.log.error("ERROR!! No header or payload");
      callback();
    }
    if(ref2 = message.header.name, indexOf.call(notLoggedEventTypes, ref2) < 0) {
      Meteor.log.info(`redis incoming message  ${eventName}  `, {
        message: data.jsonMsg
      });
    }

    // we currently disregard the pattern and channel
    if(((message != null ? message.header : void 0) != null) && (message.payload != null)) {
      if(eventName === 'meeting_created_message') {
        // Meteor.log.error JSON.stringify message
        meetingName = message.payload.name;
        intendedForRecording = message.payload.recorded;
        voiceConf = message.payload.voice_conf;
        duration = message.payload.duration;
        return addMeetingToCollection(meetingId, meetingName, intendedForRecording, voiceConf, duration, callback);

      // handle voice events
      } else if ((message.payload.user != null) && (eventName === 'user_left_voice_message' || eventName === 'user_joined_voice_message' || eventName === 'user_voice_talking_message' || eventName === 'user_voice_muted_message')) {
        voiceUserObj = {
          'web_userid': message.payload.user.voiceUser.web_userid,
          'listen_only': message.payload.listen_only,
          'talking': message.payload.user.voiceUser.talking,
          'joined': message.payload.user.voiceUser.joined,
          'locked': message.payload.user.voiceUser.locked,
          'muted': message.payload.user.voiceUser.muted
        };
        return updateVoiceUser(meetingId, voiceUserObj, callback);
      } else if(eventName === 'user_listening_only') {
        voiceUserObj = {
          'web_userid': message.payload.userid,
          'listen_only': message.payload.listen_only
        };
        return updateVoiceUser(meetingId, voiceUserObj, callback);
      } else if (eventName === 'get_all_meetings_reply') {
        Meteor.log.info("Let's store some data for the running meetings so that when an HTML5 client joins everything is ready!");
        Meteor.log.info(JSON.stringify(message));
        listOfMeetings = message.payload.meetings;

        // Processing the meetings recursively with a callback to notify us,
        // ensuring that we update the meeting collection serially
        processMeeting = function() {
          let meeting;
          meeting = listOfMeetings.pop();
          if(meeting != null) {
            return addMeetingToCollection(meeting.meetingID, meeting.meetingName, meeting.recorded, meeting.voiceBridge, meeting.duration, processMeeting);
          } else {
            return callback(); // all meeting arrays (if any) have been processed
          }
        };
        return processMeeting();
      } else if(eventName === 'user_joined_message') {
        userObj = message.payload.user;
        dbUser = Meteor.Users.findOne({
          userId: userObj.userid,
          meetingId: message.payload.meeting_id
        });

        // On attempting reconnection of Flash clients (in voiceBridge) we receive
        // an extra user_joined_message. Ignore it as it will add an extra user
        // in the user list, creating discrepancy with the list in the Flash client
        if((dbUser != null ? (ref3 = dbUser.user) != null ? ref3.connection_status : void 0 : void 0) === "offline" && ((ref4 = message.payload.user) != null ? ref4.phone_user : void 0)) {
          Meteor.log.error("offline AND phone user");
          return callback(); //return without joining the user
        } else {
          if((dbUser != null ? dbUser.clientType : void 0) === "HTML5") { // typically html5 users will be in
            // the db [as a dummy user] before the joining message
            status = dbUser != null ? dbUser.validated : void 0;
            Meteor.log.info(`in user_joined_message the validStatus of the user was ${status}`);
            userObj.timeOfJoining = message.header.current_time;
            return userJoined(meetingId, userObj, callback);
          } else {
            return userJoined(meetingId, userObj, callback);
          }
        }

      // only process if requester is nodeJSapp means only process in the case when
      // we explicitly request the users
      } else if(eventName === 'get_users_reply' && message.payload.requester_id === 'nodeJSapp') {
        users = message.payload.users;

        //TODO make the serialization be split per meeting. This will allow us to
        // use N threads vs 1 and we'll take advantage of Mongo's concurrency tricks

        // Processing the users recursively with a callback to notify us,
        // ensuring that we update the users collection serially
        processUser = function() {
          let user;
          user = users.pop();
          if(user != null) {
            user.timeOfJoining = message.header.current_time;
            if(user.emoji_status !== 'none' && typeof user.emoji_status === 'string') {
              console.log("3");
              user.set_emoji_time = new Date();
              return userJoined(meetingId, user, processUser);
            } else {
              // console.error("this is not supposed to happen")
              return userJoined(meetingId, user, processUser);
            }
          } else {
            return callback(); // all meeting arrays (if any) have been processed
          }
        };
        return processUser();
      } else if(eventName === 'validate_auth_token_reply') {
        userId = message.payload.userid;
        user = Meteor.Users.findOne({
          userId: userId,
          meetingId: meetingId
        });
        validStatus = message.payload.valid;

        // if the user already exists in the db
        if((user != null ? user.clientType : void 0) === "HTML5") {
          //if the html5 client user was validated successfully, add a flag
          return Meteor.Users.update({
            userId: userId,
            meetingId: message.payload.meeting_id
          }, {
            $set: {
              validated: validStatus
            }
          }, (err, numChanged) => {
            let funct;
            if(numChanged.insertedId != null) {
              funct = function(cbk) {
                let ref5, val;
                val = (ref5 = Meteor.Users.findOne({
                  userId: userId,
                  meetingId: message.payload.meeting_id
                })) != null ? ref5.validated : void 0;
                Meteor.log.info(`user.validated for user ${userId} in meeting ${user.meetingId} just became ${val}`);
                return cbk();
              };
              return funct(callback);
            } else {
              return callback();
            }
          });
        } else {
          Meteor.log.info("a non-html5 user got validate_auth_token_reply.");
          return callback();
        }
      } else if(eventName === 'user_left_message') {
        userId = (ref5 = message.payload.user) != null ? ref5.userid : void 0;
        if((userId != null) && (meetingId != null)) {
          return markUserOffline(meetingId, userId, callback);
        } else {
          return callback(); //TODO check how to get these cases out and reuse code
        }

      // for now not handling this serially #TODO
      } else if(eventName === 'presenter_assigned_message') {
        newPresenterId = message.payload.new_presenter_id;
        if(newPresenterId != null) {
          // reset the previous presenter
          Meteor.Users.update({
            "user.presenter": true,
            meetingId: meetingId
          }, {
            $set: {
              "user.presenter": false
            }
          }, (err, numUpdated) => {
            return Meteor.log.info(` Updating old presenter numUpdated=${numUpdated}, err=${err}`);
          });
          // set the new presenter
          Meteor.Users.update({
            "user.userid": newPresenterId,
            meetingId: meetingId
          }, {
            $set: {
              "user.presenter": true
            }
          }, (err, numUpdated) => {
            return Meteor.log.info(` Updating new presenter numUpdated=${numUpdated}, err=${err}`);
          });
        }
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === 'user_emoji_status_message') {
        userId = message.payload.userid;
        meetingId = message.payload.meeting_id;
        emojiStatus = message.payload.emoji_status;
        if((userId != null) && (meetingId != null)) {
          set_emoji_time = new Date();
          Meteor.Users.update({
            "user.userid": userId
          }, {
            $set: {
              "user.set_emoji_time": set_emoji_time,
              "user.emoji_status": emojiStatus
            }
          }, (err, numUpdated) => {
            return Meteor.log.info(` Updating emoji numUpdated=${numUpdated}, err=${err}`);
          });
        }
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === 'user_locked_message' || eventName === 'user_unlocked_message') {
        userId = message.payload.userid;
        isLocked = message.payload.locked;
        setUserLockedStatus(meetingId, userId, isLocked);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "meeting_ended_message" || eventName === "meeting_destroyed_event" || eventName === "end_and_kick_all_message" || eventName === "disconnect_all_users_message") {
        Meteor.log.info(`DESTROYING MEETING ${meetingId}`);
        return removeMeetingFromCollection(meetingId, callback);

        /*
         if Meteor.Meetings.findOne({meetingId: meetingId})?
          count=Meteor.Users.find({meetingId: meetingId}).count()
          Meteor.log.info "there are #{count} users in the meeting"
          for user in Meteor.Users.find({meetingId: meetingId}).fetch()
            markUserOffline meetingId, user.userId
          #TODO should we clear the chat messages for that meeting?!
          unless eventName is "disconnect_all_users_message"
            removeMeetingFromCollection meetingId
         */

      // for now not handling this serially #TODO
      } else if(eventName === "get_chat_history_reply" && message.payload.requester_id === "nodeJSapp") {
        if(Meteor.Meetings.findOne({
          MeetingId: message.payload.meeting_id
        }) == null) {
          ref6 = message.payload.chat_history;
          for(i = 0, len = ref6.length; i < len; i++) {
            chatMessage = ref6[i];
            addChatToCollection(meetingId, chatMessage);
          }
        }
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "send_public_chat_message" || eventName === "send_private_chat_message") {
        messageObject = message.payload.message;
        // use current_time instead of message.from_time so that the chats from Flash and HTML5 have uniform times
        messageObject.from_time = message.header.current_time;
        addChatToCollection(meetingId, messageObject);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "presentation_shared_message") {
        presentationId = (ref7 = message.payload.presentation) != null ? ref7.id : void 0;
        // change the currently displayed presentation to presentation.current = false
        Meteor.Presentations.update({
          "presentation.current": true,
          meetingId: meetingId
        }, {
          $set: {
            "presentation.current": false
          }
        });

        //update(if already present) entirely the presentation with the fresh data
        removePresentationFromCollection(meetingId, presentationId);
        addPresentationToCollection(meetingId, message.payload.presentation);
        ref9 = (ref8 = message.payload.presentation) != null ? ref8.pages : void 0;
        for(j = 0, len1 = ref9.length; j < len1; j++) {
          slide = ref9[j];
          addSlideToCollection(
            meetingId,
            (ref10 = message.payload.presentation) != null ? ref10.id : void 0,
            slide
          );
          if(slide.current) {
            displayThisSlide(meetingId, slide.id, slide);
          }
        }
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "get_presentation_info_reply" && message.payload.requester_id === "nodeJSapp") {
        ref11 = message.payload.presentations;
        for(k = 0, len2 = ref11.length; k < len2; k++) {
          presentation = ref11[k];
          addPresentationToCollection(meetingId, presentation);
          ref12 = presentation.pages;
          for(l = 0, len3 = ref12.length; l < len3; l++) {
            page = ref12[l];

            //add the slide to the collection
            addSlideToCollection(meetingId, presentation.id, page);

            //request for shapes
            whiteboardId = `${presentation.id}/${page.num}`; // d2d9a672040fbde2a47a10bf6c37b6a4b5ae187f-1404411622872/1
            //Meteor.log.info "the whiteboard_id here is:" + whiteboardId

            replyTo = `${meetingId}/nodeJSapp`;
            message = {
              "payload": {
                "meeting_id": meetingId,
                "requester_id": "nodeJSapp",
                "whiteboard_id": whiteboardId,
                "reply_to": replyTo
              },
              "header": {
                "timestamp": new Date().getTime(),
                "name": "request_whiteboard_annotation_history_request"
              }
            };
            if((whiteboardId != null) && (meetingId != null)) {
              publish(Meteor.config.redis.channels.toBBBApps.whiteboard, message);
            } else {
              Meteor.log.info("did not have enough information to send a user_leaving_request");
            }
          }
        }
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "presentation_page_changed_message") {
        newSlide = message.payload.page;
        displayThisSlide(meetingId, newSlide != null ? newSlide.id : void 0, newSlide);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "presentation_removed_message") {
        presentationId = message.payload.presentation_id;
        meetingId = message.payload.meeting_id;
        removePresentationFromCollection(meetingId, presentationId);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "get_whiteboard_shapes_reply" && message.payload.requester_id === "nodeJSapp") {
        // Create a whiteboard clean status or find one for the current meeting
        if(Meteor.WhiteboardCleanStatus.findOne({
          meetingId: meetingId
        }) == null) {
          Meteor.WhiteboardCleanStatus.insert({
            meetingId: meetingId,
            in_progress: false
          });
        }
        ref13 = message.payload.shapes;
        for(m = 0, len4 = ref13.length; m < len4; m++) {
          shape = ref13[m];
          whiteboardId = shape.wb_id;
          addShapeToCollection(meetingId, whiteboardId, shape);
        }
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "send_whiteboard_shape_message") {
        //Meteor stringifies an array of JSONs (...shape.result) in this message
        //parsing the String and reassigning the value
        if(message.payload.shape.shape_type === "poll_result" && typeof message.payload.shape.shape.result === 'string') {
          message.payload.shape.shape.result = JSON.parse(message.payload.shape.shape.result);
        }
        shape = message.payload.shape;
        whiteboardId = shape != null ? shape.wb_id : void 0;
        addShapeToCollection(meetingId, whiteboardId, shape);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "presentation_cursor_updated_message") {
        cursor = {
          x: message.payload.x_percent,
          y: message.payload.y_percent
        };

        // update the location of the cursor on the whiteboard
        updateCursorLocation(meetingId, cursor);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "whiteboard_cleared_message") {
          whiteboardId = message.payload.whiteboard_id;
          Meteor.WhiteboardCleanStatus.update({
          meetingId: meetingId
        }, {
          $set: {
            'in_progress': true
          }
        });
        removeAllShapesFromSlide(meetingId, whiteboardId);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "undo_whiteboard_request") {
        whiteboardId = message.payload.whiteboard_id;
        shapeId = message.payload.shape_id;
        removeShapeFromSlide(meetingId, whiteboardId, shapeId);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "presentation_page_resized_message") {
        slideId = (ref14 = message.payload.page) != null ? ref14.id : void 0;
        heightRatio = (ref15 = message.payload.page) != null ? ref15.height_ratio : void 0;
        widthRatio = (ref16 = message.payload.page) != null ? ref16.width_ratio : void 0;
        xOffset = (ref17 = message.payload.page) != null ? ref17.x_offset : void 0;
        yOffset = (ref18 = message.payload.page) != null ? ref18.y_offset : void 0;
        presentationId = slideId.split("/")[0];
        Meteor.Slides.update({
          presentationId: presentationId,
          "slide.current": true
        }, {
          $set: {
            "slide.height_ratio": heightRatio,
            "slide.width_ratio": widthRatio,
            "slide.x_offset": xOffset,
            "slide.y_offset": yOffset
          }
        });
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "recording_status_changed_message") {
        intendedForRecording = message.payload.recorded;
        currentlyBeingRecorded = message.payload.recording;
        Meteor.Meetings.update({
          meetingId: meetingId,
          intendedForRecording: intendedForRecording
        }, {
          $set: {
            currentlyBeingRecorded: currentlyBeingRecorded
          }
        });
        return callback();

      // --------------------------------------------------
      // lock settings ------------------------------------
      // for now not handling this serially #TODO
      } else if(eventName === "eject_voice_user_message") {
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "new_permission_settings") {
        oldSettings = (ref19 = Meteor.Meetings.findOne({
          meetingId: meetingId
        })) != null ? ref19.roomLockSettings : void 0;
        newSettings = (ref20 = message.payload) != null ? ref20.permissions : void 0;

        // if the disableMic setting was turned on
        if(!(oldSettings != null ? oldSettings.disableMic : void 0) && newSettings.disableMic) {
          handleLockingMic(meetingId, newSettings);
        }

        // substitute with the new lock settings
        Meteor.Meetings.update({
          meetingId: meetingId
        }, {
          $set: {
            'roomLockSettings.disablePrivateChat': newSettings.disablePrivateChat,
            'roomLockSettings.disableCam': newSettings.disableCam,
            'roomLockSettings.disableMic': newSettings.disableMic,
            'roomLockSettings.lockOnJoin': newSettings.lockOnJoin,
            'roomLockSettings.lockedLayout': newSettings.lockedLayout,
            'roomLockSettings.disablePublicChat': newSettings.disablePublicChat,
            'roomLockSettings.lockOnJoinConfigurable': newSettings.lockOnJoinConfigurable
          }
        });
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "poll_started_message") {
        if((message.payload.meeting_id != null) && (message.payload.requester_id != null) && (message.payload.poll != null)) {
          if(Meteor.Meetings.findOne({
            meetingId: message.payload.meeting_id
          }) != null) {
            users = Meteor.Users.find({
              meetingId: message.payload.meeting_id
            }, {
              fields: {
                "user.userid": 1,
                _id: 0
              }
            }).fetch();
            addPollToCollection(
              message.payload.poll,
              message.payload.requester_id,
              users,
              message.payload.meeting_id
            );
          }
        }
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "poll_stopped_message") {
        meetingId = message.payload.meeting_id;
        poll_id = message.payload.poll_id;
        clearPollCollection(meetingId, poll_id);
        return callback();

      // for now not handling this serially #TODO
      } else if(eventName === "user_voted_poll_message") {
        if((((ref21 = message.payload) != null ? ref21.poll : void 0) != null) && (message.payload.meeting_id != null) && (message.payload.presenter_id != null)) {
          pollObj = message.payload.poll;
          meetingId = message.payload.meeting_id;
          requesterId = message.payload.presenter_id;
          updatePollCollection(pollObj, meetingId, requesterId);
          return callback();
        }

      // for now not handling this serially #TODO
      } else if(eventName === "poll_show_result_message") {
        if((message.payload.poll.id != null) && (message.payload.meeting_id != null)) {
          poll_id = message.payload.poll.id;
          meetingId = message.payload.meeting_id;
          clearPollCollection(meetingId, poll_id);
        }
        return callback();
      } else { // keep moving in the queue
        if(indexOf.call(notLoggedEventTypes, eventName) < 0) {
          Meteor.log.info(`WARNING!!! THE JSON MESSAGE WAS NOT OF TYPE SUPPORTED BY THIS APPLICATION
 ${eventName}   {JSON.stringify message}`);
        }
        return callback();
      }
    } else {
      return callback();
    }
  };
});
