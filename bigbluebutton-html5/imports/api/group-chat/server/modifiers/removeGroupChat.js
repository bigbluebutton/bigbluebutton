import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GroupChat from '/imports/api/group-chat';
import clearGroupChatMsg from '/imports/api/group-chat-msg/server/modifiers/clearGroupChatMsg';

export default async function removeGroupChat(meetingId, chatId) {
  check(meetingId, String);
  check(chatId, String);

  const selector = {
    chatId,
    meetingId,
  };

  try {
    const numberAffected = await GroupChat.removeAsync(selector);

    if (numberAffected) {
      Logger.info(`Removed group-chat id=${chatId} meeting=${meetingId}`);
      clearGroupChatMsg(meetingId, chatId);
    }
  } catch (err) {
    Logger.error(`Removing group-chat from collection: ${err}`);
  }
}
