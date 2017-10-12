import Chat from '/imports/api/chat';
import Logger from '/imports/startup/server/logger';

export default function clearChats(meetingId) {
  if (meetingId) {
    return Chat.remove({ meetingId }, Logger.info(`Cleared Chats (${meetingId})`));
  }

  return Chat.remove({}, Logger.info('Cleared Chats (all)'));
}
