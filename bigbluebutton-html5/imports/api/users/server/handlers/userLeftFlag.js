import { check } from 'meteor/check';

import userLeftFlag from '../modifiers/userLeftFlag';

export default function handleUserLeftFlag({ body }, meetingId) {
  const user = body;
  check(user, Object);

  userLeftFlag(meetingId, user.intId, user.userLeftFlag);
}
