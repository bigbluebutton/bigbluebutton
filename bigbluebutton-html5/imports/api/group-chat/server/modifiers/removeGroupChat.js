import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GroupChat from '/imports/api/group-chat';
import clearGroupChatMsg from 'imports/api/group-chat-msg/server/modifiers/clearGroupChatMsg';

export default function removeGroupChat(meetingId, chatId) {
  check(meetingId, String);
  check(chatId, String);

  const selector = {
    chatId,
    meetingId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Removing group-chat from collection: ${err}`);
      return;
    }

    if (numChanged) {
      // TODO: Clear group-chat-messages
      Logger.info(`Removed group-chat id=${chatId} meeting=${meetingId}`);
      clearGroupChatMsg(meetingId, chatId);
    }
  };

  return GroupChat.remove(selector, cb);
}
