import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
export default function changeRole(role, userId, meetingId, changedBy) {
  const selector = {
    meetingId,
    userId,
  };
  console.error('\n\n');

  const modifier = {
    $set: {
      role,
      moderator: role === ROLE_MODERATOR,
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
