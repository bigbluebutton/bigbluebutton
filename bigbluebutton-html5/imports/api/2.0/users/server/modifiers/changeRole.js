import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import Users from '/imports/api/2.0/users';

export default function handleChangeRole({ body }, meetingId) {
  const { userId, role, changedBy } = body;

  check(userId, String);
  check(role, String);
  check(changedBy, String);

  const selector = {
    meetingId,
    userId,
  };

  const userRoles = [
    'viewer',
    role === 'MODERATOR' ? 'moderator' : false,
  ].filter(Boolean);

  const modifier = {
    $set: {
      role,
      roles: userRoles,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Changed user role ${role} id=${userId} meeting=${meetingId} by changedBy=${changedBy}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
