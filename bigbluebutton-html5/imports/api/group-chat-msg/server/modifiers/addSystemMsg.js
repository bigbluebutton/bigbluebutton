import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import { BREAK_LINE } from '/imports/utils/lineEndings';

export function parseMessage(message) {
  let parsedMessage = message || '';

  // Replace \r and \n to <br/>
  parsedMessage = parsedMessage.replace(/([^>\r\n]?)(\r\n|\n\r|\r|\n)/g, `$1${BREAK_LINE}$2`);

  // Replace flash links to html valid ones
  parsedMessage = parsedMessage.split('<a href=\'event:').join('<a target="_blank" href=\'');
  parsedMessage = parsedMessage.split('<a href="event:').join('<a target="_blank" href="');

  return parsedMessage;
}

export default function addSystemMsg(meetingId, chatId, msg) {
  check(meetingId, String);
  check(chatId, String);
  check(msg, {
    id: Match.Maybe(String),
    timestamp: Number,
    sender: Object,
    message: String,
    messageValues: Match.Maybe(Object),
    extra: Match.Maybe(Object),
    correlationId: Match.Maybe(String),
  });
  const msgDocument = {
    ...msg,
    sender: msg.sender.id,
    meetingId,
    chatId,
    message: parseMessage(msg.message),
  };

  try {
    const insertedId = GroupChatMsg.insert(msgDocument);

    if (insertedId) {
      Logger.info(`Added system-msg msgId=${msg.id} chatId=${chatId} meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Error on adding system-msg to collection: ${err}`);
  }
}
