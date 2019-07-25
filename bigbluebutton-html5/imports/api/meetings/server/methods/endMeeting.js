import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';

export default function endMeeting(credentials) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'LogoutAndEndMeetingCmdMsg';
  const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const selector = {
    meetingId,
    userId: requesterUserId,
  };
  const user = Users.findOne(selector);

  if (!!user && user.role === ROLE_MODERATOR) {
    const payload = {
      userId: requesterUserId,
    };

    Logger.verbose(`Meeting '${meetingId}' is destroyed by '${requesterUserId}'`);

    return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  }
}
