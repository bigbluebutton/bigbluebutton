import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import GroupChatMsg from '/imports/api/group-chat-msg';

export default async function removeGroupChatMsg(meetingId, chatId) {
  check(meetingId, String);
  check(chatId, String);

  const selector = {
    chatId,
    meetingId,
  };

  try {
    const numberAffected = await GroupChatMsg.removeAsync(selector);

    if (numberAffected) {
      Logger.info(`Removed group-chat-msg id=${chatId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Removing group-chat-msg from collection: ${err}`);
  }
}
