import { check } from 'meteor/check';

import removeUser from '../modifiers/removeUser';

export default function handleRemoveUser({ header, body }) {
  const meetingId = header.meetingId;
  const userId = body.intId;

  check(meetingId, String);
  check(userId, String);

  return removeUser(meetingId, userId);
}
