import { check } from 'meteor/check';
import Users from '/imports/api/users';
import changeRole from '/imports/api/users/server/modifiers/changeRole';

export default function handleChangeRole(payload, meetingId) {
  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_MODERATOR = USER_CONFIG.role_moderator;
  const ROLE_VIEWER = USER_CONFIG.role_viewer;

  check(payload.body, Object);
  check(meetingId, String);

  const { userId, role, changedBy } = payload.body;

  const selector = {
    meetingId,
    userId,
  };

  const user = Users.findOne(selector);

  if (role === ROLE_VIEWER && user.role === ROLE_MODERATOR) {
    changeRole(ROLE_MODERATOR, false, userId, meetingId, changedBy);
  }

  return changeRole(role, true, userId, meetingId, changedBy);
}
