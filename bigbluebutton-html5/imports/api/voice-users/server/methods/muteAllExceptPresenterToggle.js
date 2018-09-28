import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import VoiceUsers from '/imports/api/voice-users';
import Meetings from '/imports/api/meetings';

export default function muteAllExceptPresenterToggle(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteAllExceptPresentersCmdMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  const meeting = Meetings.findOne({ meetingId });

  const voiceUser = VoiceUsers.findOne({
    intId: userId,
  });


  const { muted } = voiceUser;

  const payload = {
    mutedBy: requesterUserId,
    mute: meeting.voiceProp.muteOnStart ? muted : !muted,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
