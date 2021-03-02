import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function changeRole(role, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      role,
    },
  };

  try {
    const numberAffected = Users.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Changed user role=${role} id=${userId} meeting=${meetingId}`
        + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }
  } catch (err) {
    Logger.error(`Changed user role: ${err}`);
  }
}
