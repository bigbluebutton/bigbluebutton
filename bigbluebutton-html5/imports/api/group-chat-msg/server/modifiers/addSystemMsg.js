import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import { parseMessage } from '/imports/api/common/server/helpers';

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
    messageHtml: parseMessage(msg.messageHtml),
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
