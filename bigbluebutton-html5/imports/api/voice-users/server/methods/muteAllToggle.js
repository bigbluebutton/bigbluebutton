import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Meetings from '/imports/api/meetings';

export default function muteAllToggle(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteMeetingCmdMsg';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  const meeting = Meetings.findOne({ meetingId });
  const toggleMeetingMuted = !meeting.voiceProp.muteOnStart;

  const payload = {
    mutedBy: requesterUserId,
    mute: toggleMeetingMuted,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
