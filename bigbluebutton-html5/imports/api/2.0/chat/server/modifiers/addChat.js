import flat from 'flat';
import Chat from '/imports/api/2.0/chat';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { BREAK_LINE } from '/imports/utils/lineEndings';

const parseMessage = (message) => {
  let parsedMessage = message || '';

  // Replace \r and \n to <br/>
  parsedMessage = parsedMessage.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${BREAK_LINE}$2`);

  // Replace flash links to html valid ones
  parsedMessage = parsedMessage.split('<a href=\'event:').join('<a target="_blank" href=\'');
  parsedMessage = parsedMessage.split('<a href="event:').join('<a target="_blank" href="');

  return parsedMessage;
};

export default function addChat(meetingId, message) {
  const parsedMessage = message;
  parsedMessage.message = parseMessage(message.message);

  const fromUserId = message.fromUserId;
  const toUserId = message.toUserId;

  check(fromUserId, String);
  check(toUserId, String);

  const selector = {
    meetingId,
    'message.fromTime': parsedMessage.fromTime,
    'message.fromUserId': parsedMessage.fromUserId,
    'message.toUserId': parsedMessage.toUserId,
  };

  const modifier = {
    $set: {
      meetingId,
      message: flat(parsedMessage, { safe: true }),
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding chat to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    const to = message.toUsername || 'PUBLIC';
    return Logger.info(`Added chat id=${insertedId} from=${message.fromUsername} to=${to}`);
  };

  return Chat.upsert(selector, modifier, cb);
}
