import Chat from '/imports/api/chat';
import Logger from '/imports/startup/server/logger';

// called on server start and meeting end
export default function clearChats(meetingId) {
  if (meetingId) {
    return Chat.remove({ meetingId: meetingId, }, Logger.info(`Cleared Chats (${meetingId})`));
  } else {
    return Chat.remove({}, Logger.info('Cleared Chats (all)'));
  }
};
