import GroupChat from '/imports/api/group-chat';
import Logger from '/imports/startup/server/logger';
import clearGroupChatMsg from '/imports/api/group-chat-msg/server/modifiers/clearGroupChatMsg';

export default async function clearGroupChat(meetingId) {
  try {
    await clearGroupChatMsg(meetingId);
    const numberAffected = await GroupChat.removeAsync({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared GroupChat (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing GroupChat (${meetingId}). ${err}`);
  }
}
