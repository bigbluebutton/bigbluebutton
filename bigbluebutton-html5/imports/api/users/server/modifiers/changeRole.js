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

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed user role=${role} id=${userId} meeting=${meetingId}`
      + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
