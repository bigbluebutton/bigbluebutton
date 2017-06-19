import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/1.1/users';

export default function assignPresenter(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.users;
  const EVENT_NAME = 'assign_presenter_request_message';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const User = Users.findOne({
    meetingId,
    userId,
  });

  if (!User) {
    throw new Meteor.Error(
      'user-not-found', 'You need a valid user to be able to set presenter');
  }

  const payload = {
    new_presenter_id: userId,
    new_presenter_name: User.user.name,
    meeting_id: meetingId,
    assigned_by: requesterUserId,
  };

  Logger.verbose(`User '${userId}' setted as presenterby '${
    requesterUserId}' from meeting '${meetingId}'`);

  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
