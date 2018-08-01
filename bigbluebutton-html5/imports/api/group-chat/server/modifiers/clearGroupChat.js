import GroupChat from '/imports/api/group-chat';
import Logger from '/imports/startup/server/logger';
import clearGroupChatMsg from 'imports/api/group-chat-msg/server/modifiers/clearGroupChatMsg';

export default function clearGroupChat(meetingId) {
  if (meetingId) {
    clearGroupChatMsg(meetingId);
    return GroupChat.remove({ meetingId }, Logger.info(`Cleared GroupChat (${meetingId})`));
  }

  clearGroupChatMsg();
  return GroupChat.remove({}, Logger.info('Cleared GroupChat (all)'));
}
