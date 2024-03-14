import { check } from 'meteor/check';

import removeUser from '../modifiers/removeUser';

export default async function handleRemoveUser({ body }, meetingId) {
  const { intId } = body;

  check(meetingId, String);
  check(intId, String);

  const result = await removeUser(body, meetingId);
  return result;
}
