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

  var eventEmitter = new EventEmitter();
  registerHandlers(eventEmitter);


  // create create a PubSub connection, start listening
  Meteor.redisPubSub = new Meteor.RedisPubSub(function () {
    return Meteor.log.info('created pubsub');
  });

  Meteor.myQueue = new PowerQueue({
    // autoStart:true
    // isPaused: true
  });

  Meteor.myQueue.taskHandler = function (data, next, failures) {
    let eventName, parsedMsg, length, lengthString;
    parsedMsg = JSON.parse(data.jsonMsg);
    // length = Meteor.myQueue.length();
    // lengthString = '' + function () {
    //     if (length > 0) {
    //       return `In the queue we have ${length} event(s) to process.`;
    //     }
    //   };
    //
    // Meteor.log.info(`in callback after handleRedisMessage ${eventName}. ${lengthString()}`);
    if (parsedMsg != null) {
      eventName = parsedMsg.header.name;
    }
    console.log("in taskHandler:" + eventName);

    if (failures > 0) {
      return Meteor.log.error(`got a failure on taskHandler ${eventName} ${failures}`);
      // TODO should we stop or instead return next?
    } else {
      console.log("^^^^^^^^", parsedMsg);
      return eventEmitter.emit(eventName, {
        payload: parsedMsg.payload,
        header: parsedMsg.header,

        callback: () => {
          console.log("ready for next message");
          return next();
        },
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
  /*return this.handleRedisMessage = function (data, bigCallback) {
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
      'get_recording_status_reply',];

    if (message == null || message.header == null || payload == null) {
      Meteor.log.error('ERROR!! No header or payload');
      bigCallback();
    } else {
      Meteor.log.info("_________________1");
      eventEmitter.emit("blah", {
        // eventEmitter.emit(eventName, {
        meetingId: meetingId,
        message: message, //this is the JSON message
        c: function() {
          console.log("in c:", bigCallback);
          // bigCallback();
        },
      });
    }

    // LOG in the meteor console
    if (eventName, indexOf.call(notLoggedEventTypes, eventName) < 0) {
      Meteor.log.info(`redis incoming message  ${eventName}  `, {
        message: data.jsonMsg,
      });
    }

    // TODO should I call callback here?!

  };
  */
});
