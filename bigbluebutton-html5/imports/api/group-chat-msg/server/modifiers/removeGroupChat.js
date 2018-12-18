import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GroupChatMsg from '/imports/api/group-chat-msg';

export default function removeGroupChat(meetingId, chatId) {
  check(meetingId, String);
  check(chatId, String);

  const selector = {
    chatId,
    meetingId,
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Removing group-chat-msg from collection: ${err}`);
      return;
    }

    if (numChanged) {
      // TODO: Clear group-chat-msg-messages
      Logger.info(`Removed group-chat-msg id=${chatId} meeting=${meetingId}`);
    }
  };

  return GroupChatMsg.remove(selector, cb);
}
