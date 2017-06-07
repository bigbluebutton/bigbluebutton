import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import kickUser from '../modifiers/kickUser';

export default function handleKickUser({ payload }) {
  const meetingId = payload.meeting_id;
  const userId = payload.userid || payload.user.userid;

  check(meetingId, String);
  check(userId, String);

  return kickUser(meetingId, userId);
}
