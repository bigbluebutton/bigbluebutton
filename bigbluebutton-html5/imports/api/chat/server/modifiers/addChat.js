import Chat from '/imports/api/chat';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { BREAK_LINE } from '/imports/utils/lineEndings.js';

const parseMessage = (message) => {
  message = message || '';

  // Replace \r and \n to <br/>
  message = message.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, '$1' + BREAK_LINE + '$2');

  // Replace flash links to html valid ones
  message = message.split(`<a href='event:`).join(`<a target="_blank" href='`);
  message = message.split(`<a href="event:`).join(`<a target="_blank" href="`);

  return message;
};

export default function addChat(meetingId, message) {
  // manually convert time from 1.408645053653E12 to 1408645053653 if necessary
  // (this is the time_from that the Flash client outputs)
  message.from_time = +(message.from_time.toString().split('.').join('').split('E')[0]);
  message.message = parseMessage(message.message);

  const fromUserId = message.from_userid;
  const toUserId = message.to_userid;

  check(fromUserId, String);
  check(toUserId, String);

  const selector = {
    meetingId,
    'message.from_time': message.from_time,
    'message.from_userid': message.from_userid,
    'message.to_userid': message.to_userid,
  };

  const modifier = {
    $set: {
      meetingId,
      message: {
        chat_type: message.chat_type,
        message: message.message,
        to_username: message.to_username,
        from_tz_offset: message.from_tz_offset,
        from_color: message.from_color,
        to_userid: message.to_userid,
        from_userid: message.from_userid,
        from_time: message.from_time,
        from_username: message.from_username,
        from_lang: message.from_lang,
      },
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding chat to collection: ${err}`);
    }

    const { insertedId } = numChanged;

    if (insertedId) {
      const to = message.to_username || 'PUBLIC';
      return Logger.info(`Added chat id=${insertedId} from=${message.from_username} to=${to}`);
    }
  };

  return Chat.upsert(selector, modifier, cb);
};
