import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function changeRole(role, status, userId, meetingId, changedBy) {
  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_PRESENTER = USER_CONFIG.role_presenter;

  const selector = {
    meetingId,
    userId,
  };

  const action = status ? '$push' : '$pop';

  const user = Users.findOne(selector);

  const modifier = {
    $set: {
      role: (role === ROLE_PRESENTER ? user.role : role),
      [role.toLowerCase()]: status,
    },
    [action]: {
      roles: (role.toLowerCase()),
    },
  };

  const cb = (err, numChanged) => {
    const actionVerb = (status) ? 'Changed' : 'Removed';

    if (err) {
      return Logger.error(`Changed user role: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`${actionVerb} user role=${role} id=${userId} meeting=${meetingId}`
      + `${changedBy ? ` changedBy=${changedBy}` : ''}`);
    }

    return null;
  };

  return Users.update(selector, modifier, cb);
}
