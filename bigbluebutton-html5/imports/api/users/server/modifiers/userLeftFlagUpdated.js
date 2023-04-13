import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default async function userLeftFlagUpdated(meetingId, userId, left) {
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
    const numberAffected = await Users.updateAsync(selector, modifier);
    if (numberAffected) {
      Logger.info(`Updated user ${userId} with left flag as ${left} in meeting ${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Changed user role: ${err}`);
  }
}
