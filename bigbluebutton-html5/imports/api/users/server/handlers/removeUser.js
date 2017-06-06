import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import removeUser from '../modifiers/removeUser';

export default function handleRemoveUser({ payload }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid || payload.user.userid;

  check(meetingId, String);
  check(userId, String);

  return removeUser(meetingId, userId);
}
