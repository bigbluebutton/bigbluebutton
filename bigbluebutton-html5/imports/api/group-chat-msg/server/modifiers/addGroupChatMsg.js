import flat from 'flat';
import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
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

export default function addGroupChatMsg(meetingId, chatId, msg) {
  check(meetingId, String);
  check(chatId, String);
  check(msg, {
    id: Match.Maybe(String),
    timestamp: Number,
    sender: Object,
    color: String,
    message: String,
    correlationId: Match.Maybe(String),
  });

  const msgDocument = {
    ...msg,
    meetingId,
    chatId,
    message: parseMessage(msg.message),
  };

  const selector = {
    meetingId,
    chatId,
    id: msg.id,
  };

  const modifier = {
    $set: msgDocument,
  };

  try {
    const { insertedId } = GroupChatMsg.upsert(selector, modifier);

    if (insertedId) {
      Logger.info(`Added group-chat-msg msgId=${msg.id} chatId=${chatId} meetingId=${meetingId}`);
    } else {
      Logger.info(`Upserted group-chat-msg msgId=${msg.id} chatId=${chatId} meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Adding group-chat-msg to collection: ${err}`);
  }
}
