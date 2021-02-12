import Logger from '/imports/startup/server/logger';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user';

export default function clearWhiteboardMultiUser(meetingId) {
  if (meetingId) {
    try {
      const numberAffected = WhiteboardMultiUser.remove({ meetingId });

      if (numberAffected) {
        Logger.info(`Cleared WhiteboardMultiUser (${meetingId})`);
      }
    } catch (err) {
      Logger.info(`Error clearing WhiteboardMultiUser (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffected = WhiteboardMultiUser.remove({});

      if (numberAffected) {
        Logger.info('Cleared WhiteboardMultiUser (all)');
      }
    } catch (err) {
      Logger.info(`Error clearing WhiteboardMultiUser (all). ${err}`);
    }
  }
}
