import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import updateVoiceUser from '../modifiers/updateVoiceUser';

export default function handleVoiceUpdate({ payload }) {
  const meetingId = payload.meeting_id;
  const user = payload.user;

  check(meetingId, String);
  check(user, Object);

  const voiceUser = user.voiceUser;
  check(voiceUser, Object);

  const userId = voiceUser.web_userid;
  check(userId, String);

  return updateVoiceUser(meetingId, userId, voiceUser);
}
