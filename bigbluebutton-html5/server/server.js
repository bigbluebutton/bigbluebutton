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

  const eventEmitter = new (Npm.require('events').EventEmitter);
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

    if (parsedMsg != null) {
      eventName = parsedMsg.header.name;
      length = Meteor.myQueue.length();
      lengthString = function () {
            if (length > 0) {
              return `In the queue we have ${length} event(s) to process.`;
            } else return "";
          }() || "";
      Meteor.log.info(`in callback after handleRedisMessage ${eventName}. ${lengthString}`);
    }
    console.log("in taskHandler:" + eventName);

    if (failures > 0) {
      return Meteor.log.error(`got a failure on taskHandler ${eventName} ${failures}`);
      // TODO should we stop or instead return next?
    } else {
      logRedisMessage(eventName, data.jsonMsg);
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
  
  const logRedisMessage = function (eventName, json) {
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

    // LOG in the meteor console
    if (eventName, indexOf.call(notLoggedEventTypes, eventName) < 0) {
      Meteor.log.info(`redis incoming message  ${eventName}  `, {
        message: json,
      });
    }
  };

});
