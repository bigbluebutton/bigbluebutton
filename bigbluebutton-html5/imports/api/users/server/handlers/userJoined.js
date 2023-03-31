import { check } from 'meteor/check';

import addUser from '../modifiers/addUser';

export default async function handleUserJoined({ body }, meetingId) {
  const user = body;

  check(user, Object);

  await addUser(meetingId, user);
}
