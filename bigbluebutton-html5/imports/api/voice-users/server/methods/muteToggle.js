import { Meteor } from 'meteor/meteor';
import { extractCredentials } from '/imports/api/common/server/helpers';
import RedisPubSub from '/imports/startup/server/redis';
import Users from '/imports/api/users';
import VoiceUsers from '/imports/api/voice-users';

export default function muteToggle(userId) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteUserCmdMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

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

  const payload = {
    userId,
    mutedBy: requesterUserId,
    mute: !muted,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
