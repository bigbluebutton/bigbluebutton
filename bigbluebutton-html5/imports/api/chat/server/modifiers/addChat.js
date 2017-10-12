import flat from 'flat';
import Chat from '/imports/api/chat';
import Logger from '/imports/startup/server/logger';
import { Match, check } from 'meteor/check';
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

const chatType = (userName) => {
  const CHAT_CONFIG = Meteor.settings.public.chat;

  const typeByUser = {
    [CHAT_CONFIG.system_username]: CHAT_CONFIG.type_system,
    [CHAT_CONFIG.public_username]: CHAT_CONFIG.type_public,
  };

  return userName in typeByUser ? typeByUser[userName] : CHAT_CONFIG.type_private;
};

export default function addChat(meetingId, chat) {
  check(chat, {
    message: String,
    fromColor: String,
    toUserId: String,
    toUsername: String,
    fromUserId: String,
    fromUsername: Match.Maybe(String),
    fromTime: Number,
    fromTimezoneOffset: Match.Maybe(Number),
  });

  const selector = {
    meetingId,
    fromTime: chat.fromTime,
    fromUserId: chat.fromUserId,
    toUserId: chat.toUserId,
  };

  const modifier = {
    $set: Object.assign(
      flat(chat, { safe: true }),
      {
        meetingId,
        message: parseMessage(chat.message),
        type: chatType(chat.toUsername),
      },
    ),
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding chat to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    const to = chat.toUsername || 'PUBLIC';

    if (insertedId) {
      return Logger.info(`Added chat from=${chat.fromUsername} to=${to} time=${chat.fromTime}`);
    }

    return Logger.info(`Upserted chat from=${chat.fromUsername} to=${to} time=${chat.fromTime}`);
  };

  return Chat.upsert(selector, modifier, cb);
}
