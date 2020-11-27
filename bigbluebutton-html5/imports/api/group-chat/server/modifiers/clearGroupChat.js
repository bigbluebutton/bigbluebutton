import GroupChat from '/imports/api/group-chat';
import Logger from '/imports/startup/server/logger';
import clearGroupChatMsg from '/imports/api/group-chat-msg/server/modifiers/clearGroupChatMsg';

export default function clearGroupChat(meetingId) {
  try {
    clearGroupChatMsg(meetingId);
    const numberAffected = GroupChat.remove({ meetingId });

    if (numberAffected) {
      Logger.info(`Cleared GroupChat (${meetingId})`);
    }
  } catch (err) {
    Logger.error(`Error on clearing GroupChat (${meetingId}). ${err}`);
  }
}
