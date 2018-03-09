import GroupChatMsg from '/imports/api/group-chat-msg';
import Logger from '/imports/startup/server/logger';

export default function clearGroupChatMsg(meetingId, chatId) {
  if (meetingId) {
    return GroupChatMsg.remove({ meetingId }, Logger.info(`Cleared GroupChat (${meetingId})`));
  }

  if (chatId) {
    return GroupChatMsg.remove({ meetingId, chatId }, Logger.info(`Cleared GroupChat (${meetingId}, ${chatId})`));
  }

  return GroupChatMsg.remove({}, Logger.info('Cleared GroupChat (all)'));
}
