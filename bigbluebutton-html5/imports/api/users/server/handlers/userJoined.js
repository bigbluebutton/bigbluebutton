import { check } from 'meteor/check';

import addUser from '../modifiers/addUser';

export default function handleUserJoined({ body }, meetingId) {
  const user = body;
  console.error('\n\n', user);

  check(user, Object);

  return addUser(meetingId, user);
}
