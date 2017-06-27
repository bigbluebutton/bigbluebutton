import { check } from 'meteor/check';

import removeUser from '../modifiers/removeUser';

export default function handleRemoveUser({ header, body }) {
  const { meetingId } = header;
  const { intId } = body;

  check(meetingId, String);
  check(intId, String);

  return removeUser(meetingId, intId);
}
