import { Meteor } from 'meteor/meteor';
import { extractCredentials } from '/imports/api/common/server/helpers';
import RedisPubSub from '/imports/startup/server/redis';
import Users from '/imports/api/users';
import VoiceUsers from '/imports/api/voice-users';
import _ from 'lodash';

export default function muteToggle(uId, implicitMutedState) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'MuteUserCmdMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  const userToMute = uId || requesterUserId;

  const requester = Users.findOne({
    meetingId,
    userId: requesterUserId,
  });

  const voiceUser = VoiceUsers.findOne({
    intId: userToMute,
    meetingId,
  });

  if (!requester || !voiceUser) return;

  const { listenOnly, muted } = voiceUser;
  if (listenOnly) return;

  const payload = {
    userId: userToMute,
    mutedBy: requesterUserId,
    mute: _.isNil(implicitMutedState) ? !muted : implicitMutedState,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
