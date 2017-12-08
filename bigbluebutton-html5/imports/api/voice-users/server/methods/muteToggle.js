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

  const requester = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });

  const voiceUser = VoiceUsers.findOne({
    intId: userId,
  });

  if (!requester || !voiceUser) return;

  const { listenOnly, muted } = voiceUser;
  if (listenOnly) return;

  const isModerator = requester.roles.includes(ROLE_MODERATOR.toLowerCase());
  const isNotHimself = requesterUserId !== userId;

  // the ability for a moderator to unmute other users is configurable (on/off)
  if (!ALLOW_MODERATOR_TO_UNMUTE_AUDIO &&
    isModerator &&
    muted &&
    isNotHimself) return;

  const payload = {
    userId,
    mutedBy: requesterUserId,
    mute: !muted,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
