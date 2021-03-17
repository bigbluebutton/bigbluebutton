import { Meteor } from 'meteor/meteor';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

export default function requestJoinURL({ breakoutId, userId: userIdToInvite }) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  const userId = userIdToInvite || requesterUserId;
  const eventName = 'RequestBreakoutJoinURLReqMsg';

  return RedisPubSub.publishUserMessage(
    CHANNEL, eventName, meetingId, requesterUserId,
    {
      meetingId,
      breakoutId,
      userId,
    },
  );
}
