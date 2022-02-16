import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function userLeftFlagUpdated(meetingId, userId, left) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      left,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);
    if (numberAffected) {
      Logger.info(`Updated user ${userId} with left flag as ${left}`);
    }
  } catch (err) {
    Logger.error(`Changed user role: ${err}`);
  }
}
