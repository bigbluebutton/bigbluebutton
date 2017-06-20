import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import addUser from '../modifiers/addUser';

export default function handleUserJoined({ payload }) {
  const meetingId = payload.meeting_id;
  const user = payload.user;

  check(meetingId, String);
  check(user, Object);

  return addUser(meetingId, user);
}
