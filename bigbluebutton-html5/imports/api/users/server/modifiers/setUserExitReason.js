import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function setUserExitReason(meetingId, userId, reason) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      exitReason: reason,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Set exit reason userId=${userId} meeting=${meetingId}`);
    }
  } catch (err) {
    Logger.error(`Setting user exit reason: ${err}`);
  }
};
