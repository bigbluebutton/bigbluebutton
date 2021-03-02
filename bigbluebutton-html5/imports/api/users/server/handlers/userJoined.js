import { check } from 'meteor/check';

import addUser from '../modifiers/addUser';

export default function handleUserJoined({ body }, meetingId) {
  const user = body;

  check(user, Object);

  addUser(meetingId, user);
}
