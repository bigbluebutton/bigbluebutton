import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import VoiceUsers from '/imports/api/voice-users';

export default function listenOnlyToggle(credentials, isJoining = true) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(isJoining, Boolean);

  let EVENT_NAME;

  if (isJoining) {
    EVENT_NAME = 'UserConnectedToGlobalAudioMsg';
  } else {
    EVENT_NAME = 'UserDisconnectedFromGlobalAudioMsg';
  }

  const VoiceUser = VoiceUsers.findOne({
    intId: requesterUserId,
  });

  const Meeting = Meetings.findOne({ meetingId });

  if (!VoiceUser) {
    throw new Meteor.Error('user-not-found', 'You need a valid user to be able to toggle audio');
  }

  // check(User.user.name, String);

  const payload = {
    userId: requesterUserId,
    name: VoiceUser.callerName,
  };

  Logger.verbose(`VoiceUser '${requesterUserId}' ${isJoining
    ? 'joined' : 'left'} global audio from meeting '${meetingId}'`);

  return RedisPubSub.publishVoiceMessage(CHANNEL, EVENT_NAME, Meeting.voiceProp.voiceConf, payload);
}
