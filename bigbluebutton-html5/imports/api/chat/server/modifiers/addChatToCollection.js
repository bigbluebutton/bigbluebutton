import Chat from '/imports/api/chat';
import { logger } from '/imports/startup/server/logger';

const BREAK_TAG = '<br/>';

const parseMessage = (message) => {
  message = message || '';

  // Replace \r and \n to <br/>
  message = message.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + BREAK_TAG + '$2');

  // Replace flash links to html valid ones
  message = message.split(`<a href='event:`).join(`<a target="_blank" href='`);
  message = message.split(`<a href="event:`).join(`<a target="_blank" href="`);

  return message;
};

export function addChatToCollection(meetingId, messageObject) {
  let id;

  // manually convert time from 1.408645053653E12 to 1408645053653 if necessary
  // (this is the time_from that the Flash client outputs)
  messageObject.from_time = +(messageObject.from_time.toString().split('.').join('').split('E')[0]);

  messageObject.message = parseMessage(messageObject.message);

  if ((messageObject.from_userid != null) && (messageObject.to_userid != null)) {
    return id = Chat.upsert({
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
        logger.error(`_error ${err} when adding chat to collection`);
      }

      if (numChanged.insertedId != null) {
        let to = messageObject.to_username != null ? 'PUBLIC' : void 0;
        let msg = messageObject.message;
        let cId = numChanged.insertedId;
        return logger.info(`added chat id=[${cId}] ${messageObject.from_username} to ${to}:${msg}`);
      }
    });
  }
};
