import { Meteor } from 'meteor/meteor';
import { extractCredentials } from '/imports/api/common/server/helpers';
import RedisPubSub from '/imports/startup/server/redis';
import Users from '/imports/api/users';
import VoiceUsers from '/imports/api/voice-users';
import Meetings from '/imports/api/meetings';
import Logger from '/imports/startup/server/logger';

export default function muteToggle(uId) {
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

  // if allowModsToUnmuteUsers is false, users will be kicked out for attempting to unmute others
  if (requesterUserId !== userToMute && muted) {
    const meeting = Meetings.findOne({ meetingId },
      { fields: { 'usersProp.allowModsToUnmuteUsers': 1 } });
    if (meeting.usersProp && !meeting.usersProp.allowModsToUnmuteUsers) {
      Logger.warn(`Attempted unmuting by another user meetingId:${meetingId} requester: ${requesterUserId} userId: ${userToMute}`);
      return;
    }
  }

  const payload = {
    userId: userToMute,
    mutedBy: requesterUserId,
    mute: !muted,
  };

  RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
