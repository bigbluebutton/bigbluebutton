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
    messageObj: Object,
    correlationId: Match.Maybe(String),
  });

  const receivedMessageObj = msg.messageObj;
  receivedMessageObj.message = parseMessage(receivedMessageObj.message);


  const msgDocument = {
    color:"0",
    id: msg.id,
    timestamp: msg.timestamp,
    correlationId: msg.correlationId,
    sender: msg.sender.id,
    message: receivedMessageObj
  };

  const selector = {
    meetingId,
    chatId,
    id: msg.id,
  };

  const modifier = {
    $set: flat(msgDocument, { safe: true }),
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding group-chat-msg to collection: ${err}`);
    }

    const { insertedId } = numChanged;

    if (insertedId) {
      return Logger.info(`Added group-chat-msg msgId=${msg.id} chatId=${chatId} meetingId=${meetingId}`);
    }

    return Logger.info(`Upserted group-chat-msg msgId=${msg.id} chatId=${chatId} meetingId=${meetingId}`);
  };

  return GroupChatMsg.upsert(selector, modifier, cb);
}
