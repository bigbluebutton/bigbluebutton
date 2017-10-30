import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Users from '/imports/api/users';
import VoiceUsers from '/imports/api/voice-users';

export default function muteToggle(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteUserCmdMsg';
  const ALLOW_MODERATOR_TO_UNMUTE_AUDIO = true;

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  const payload = {
    userId,
    mutedBy: requesterUserId,
  };

  const { role: requesterRole } = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });

  const { muted: isUserMuted } = VoiceUsers.findOne({
    intId: userId,
  });

  if (requesterUserId !== userId && requesterRole === 'MODERATOR' && !ALLOW_MODERATOR_TO_UNMUTE_AUDIO && isUserMuted) return;

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
