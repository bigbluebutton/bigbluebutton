import { check } from 'meteor/check';

import userLeftFlag from '../modifiers/userLeftFlagUpdated';

export default function handleUserLeftFlag({ body }, meetingId) {
  const user = body;
  check(user, {
    intId: String,
    userLeftFlag: Boolean,
  });

  userLeftFlag(meetingId, user.intId, user.userLeftFlag);
}
