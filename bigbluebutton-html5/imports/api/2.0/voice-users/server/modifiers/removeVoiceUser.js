import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import VoiceUser from '/imports/api/2.0/voice-users';

export default function removeVoiceUser(meetingId, voiceUser) {
  check(meetingId, String);
  check(voiceUser, {
    voiceConf: String,
    voiceUserId: String,
  });

  const { voiceConf, voiceUserId } = voiceUser;

  return VoiceUser.remove({ meetingId, voiceConf, voiceUserId }, Logger.info(`Remove VoiceUser voiceUserId=${voiceUserId} meetingId=${meetingId}`));
}
