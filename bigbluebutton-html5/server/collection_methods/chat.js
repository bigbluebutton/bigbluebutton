Meteor.methods({
  // meetingId: the id of the meeting
  // chatObject: the object including info on the chat message, including the text
  // requesterUserId: the userId of the user sending chat
  // requesterToken: the authToken of the requester
  sendChatMessagetoServer(meetingId, chatObject, requesterUserId, requesterToken) {
    let action, chatType, eventName, message, recipient;
    chatType = chatObject.chat_type;
    recipient = chatObject.to_userid;
    eventName = null;
    action = function () {
      if (chatType === 'PUBLIC_CHAT') {
        eventName = 'send_public_chat_message';
        return 'chatPublic';
      } else {
        eventName = 'send_private_chat_message';
        if (recipient === requesterUserId) {
          return 'chatSelf'; //not allowed
        } else {
          return 'chatPrivate';
        }
      }
    };

    if (isAllowedTo(action(), meetingId, requesterUserId, requesterToken) && chatObject.from_userid === requesterUserId) {
      chatObject.message = translateHTML5ToFlash(chatObject.message);
      message = {
        header: {
          timestamp: new Date().getTime(),
          name: eventName,
        },
        payload: {
          message: chatObject,
          meeting_id: meetingId,
          requester_id: chatObject.from_userid,
        },
      };
      Meteor.log.info('publishing chat to redis');
      publish(Meteor.config.redis.channels.toBBBApps.chat, message);
    }
  },

  deletePrivateChatMessages(userId, contact_id) {
    // if authorized pass through
    let contact, requester;
    requester = Meteor.Users.findOne({
      userId: userId,
    });
    contact = Meteor.Users.findOne({
      _id: contact_id,
    });
    return deletePrivateChatMessages(requester.userId, contact.userId);
  },
});

// --------------------------------------------------------------------------------------------
// Private methods on server
// --------------------------------------------------------------------------------------------
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

// --------------------------------------------------------------------------------------------
// end Private methods on server
// --------------------------------------------------------------------------------------------

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
