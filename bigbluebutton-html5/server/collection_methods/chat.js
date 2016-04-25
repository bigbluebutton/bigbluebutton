this.addChatToCollection = function (meetingId, messageObject) {
  let id;

  // manually convert time from 1.408645053653E12 to 1408645053653 if necessary
  // (this is the time_from that the Flash client outputs)
  messageObject.from_time = messageObject.from_time.toString().split('.').join('').split('E')[0];
  if ((messageObject.from_userid != null) && (messageObject.to_userid != null)) {
    messageObject.message = translateFlashToHTML5(messageObject.message);
    return id = Meteor.Chat.upsert({
      meetingId: meetingId,
      'message.message': messageObject.message,
      'message.from_time': messageObject.from_time,
      'message.from_userid': messageObject.from_userid,
    }, {
      meetingId: meetingId,
      message: {
        chat_type: messageObject.chat_type,
        message: messageObject.message,
        to_username: messageObject.to_username,
        from_tz_offset: messageObject.from_tz_offset,
        from_color: messageObject.from_color,
        to_userid: messageObject.to_userid,
        from_userid: messageObject.from_userid,
        from_time: messageObject.from_time,
        from_username: messageObject.from_username,
        from_lang: messageObject.from_lang,
      },
    }, (err, numChanged) => {
      if (err != null) {
        Meteor.log.error(`_error ${err} when adding chat to collection`);
      }

      if (numChanged.insertedId != null) {
        return Meteor.log.info(`${messageObject.to_username != null}_added chat id=[${numChanged.insertedId}] ${messageObject.from_username} to ${messageObject.to_username != null ? 'PUBLIC' : void 0}:${messageObject.message}`);
      }
    });
  }
};

// called on server start and meeting end
this.clearChatCollection = function (meetingId) {
  if (meetingId != null) {
    return Meteor.Chat.remove({
      meetingId: meetingId,
    }, Meteor.log.info(`cleared Chat Collection (meetingId: ${meetingId}!`));
  } else {
    return Meteor.Chat.remove({}, Meteor.log.info('cleared Chat Collection (all meetings)!'));
  }
};


// translate '\n' newline character and '\r' carriage returns to '<br/>' breakline character for Flash
this.translateHTML5ToFlash = function (message) {
  let result;
  result = message;
  result = result.replace(new RegExp(CARRIAGE_RETURN, 'g'), BREAK_LINE);
  result = result.replace(new RegExp(NEW_LINE, 'g'), BREAK_LINE);
  return result;
};

// translate '<br/>' breakline character to '\r' carriage return character for HTML5
this.translateFlashToHTML5 = function (message) {
  let result;
  result = message;
  result = result.replace(new RegExp(BREAK_LINE, 'g'), CARRIAGE_RETURN);
  return result;
};
