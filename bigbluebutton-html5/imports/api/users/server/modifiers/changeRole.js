import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function changeRole({ body }, meetingId) {
  const { userId, role, changedBy } = body;

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      role,
    },
    $push: {
      roles: (role === 'MODERATOR' ? 'moderator' : 'viewer'),
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed user role ${role} id=${userId} meeting=${meetingId} by changedBy=${changedBy}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
