import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default async function setUserEffectiveConnectionType(
  meetingId,
  userId,
  effectiveConnectionType,
) {
  check(meetingId, String);
  check(userId, String);
  check(effectiveConnectionType, String);

  const selector = {
    meetingId,
    userId,
    effectiveConnectionType: { $ne: effectiveConnectionType },
  };

  const modifier = {
    $set: {
      effectiveConnectionType,
    },
  };

  try {
    const numberAffected = await Users.updateAsync(selector, modifier);

    if (numberAffected) {
      Logger.info(`Updated user ${userId} effective connection to ${effectiveConnectionType} in meeting ${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Updating user ${userId}: ${err}`);
  }
}
