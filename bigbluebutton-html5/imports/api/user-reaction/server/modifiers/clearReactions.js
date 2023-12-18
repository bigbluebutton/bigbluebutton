import UserReaction from '/imports/api/user-reaction';
import Logger from '/imports/startup/server/logger';

export default function clearReactions(meetingId) {
  const selector = {};

  if (meetingId) {
    selector.meetingId = meetingId;
  }

  try {
    const numberAffected = UserReaction.remove(selector);

    if (numberAffected) {
      if (meetingId) {
        Logger.info(`Removed UserReaction (${meetingId})`);
      } else {
        Logger.info('Removed UserReaction (all)');
      }
    } else {
      Logger.warn('Removing UserReaction nonaffected');
    }
  } catch (err) {
    Logger.error(`Removing UserReaction: ${err}`);
  }
}
