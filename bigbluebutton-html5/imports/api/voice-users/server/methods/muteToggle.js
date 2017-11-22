import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Users from '/imports/api/users';
import VoiceUsers from '/imports/api/voice-users';

export default function muteToggle(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteUserCmdMsg';
  const APP_CONFIG = Meteor.settings.public.app;
  const ALLOW_MODERATOR_TO_UNMUTE_AUDIO = APP_CONFIG.allowModeratorToUnmuteAudio;
  const USER_CONFIG = Meteor.settings.public.user;
  const ROLE_MODERATOR = USER_CONFIG.role_moderator;

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  const payload = {
    userId,
    mutedBy: requesterUserId,
  };

  const user = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });

  const voiceUser = VoiceUsers.findOne({
    intId: userId,
  });

  if (!user || !voiceUser) return;

  const isListenOnly = voiceUser.listenOnly;

  if (isListenOnly) return;

  const isModerator = user.roles.includes(ROLE_MODERATOR.toLowerCase());
  const isMuted = voiceUser.muted;
  const isNotHimself = requesterUserId !== userId;

  if (!ALLOW_MODERATOR_TO_UNMUTE_AUDIO &&
    isModerator &&
    isMuted &&
    isNotHimself) return;

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, userId, payload);
}
