import { Match, check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import { GroupChatMsg } from '/imports/api/group-chat-msg';
import changeHasMessages from '/imports/api/users-persistent-data/server/modifiers/changeHasMessages';
import { parseMessage } from '/imports/api/common/server/helpers';


export default function addGroupChatMsg(meetingId, chatId, msg) {
  check(meetingId, String);
  check(chatId, String);
  check(msg, {
    id: Match.Maybe(String),
    timestamp: Number,
    sender: Object,
    chatEmphasizedText: Boolean,
    message: String,
    messageHtml: String,
    correlationId: Match.Maybe(String),
  });

  const {
    sender,
    ...restMsg
  } = msg;

  const msgDocument = {
    ...restMsg,
    sender: sender.id,
    senderName: sender.name,
    senderRole: sender.role,
    meetingId,
    chatId,
    message: parseMessage(msg.message),
    messageHtml: parseMessage(msg.messageHtml),
  };

  try {
    const insertedId = GroupChatMsg.insert(msgDocument);

    if (insertedId) {
      changeHasMessages(true, sender.id, meetingId);
      Logger.info(`Added group-chat-msg msgId=${msg.id} chatId=${chatId} meetingId=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Error on adding group-chat-msg to collection: ${err}`);
  }
}
