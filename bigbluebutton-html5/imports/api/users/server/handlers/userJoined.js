import { check } from 'meteor/check';

import addUser from '../modifiers/addUser';

export default function handleUserJoined({ body }, meetingId) {
  const user = body;
  console.error(user);

  user.moderator = user.moderator || false;
  check(user, Object);

  return addUser(meetingId, user);
}
