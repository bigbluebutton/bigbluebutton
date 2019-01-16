import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Breakouts from '/imports/api/breakouts';

export default function requestJoinURL(credentials, { breakoutId, userId: userIdToInvite }) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  const userId = userIdToInvite || requesterUserId;
  const Breakout = Breakouts.findOne({ breakoutId });
  const BreakoutUser = Breakout.users.filter(user => user.userId === userId).shift();

  if (BreakoutUser) return null;
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
