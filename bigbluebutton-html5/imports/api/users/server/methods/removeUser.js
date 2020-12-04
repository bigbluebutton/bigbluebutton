import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Users from '/imports/api/users';
import BannedUsers from '/imports/api/users/server/store/bannedUsers';

export default function removeUser(userId, banUser) {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'EjectUserFromMeetingCmdMsg';

  const { meetingId, requesterUserId: ejectedBy } = extractCredentials(this.userId);

  check(userId, String);

  const payload = {
    userId,
    ejectedBy,
    banUser,
  };

  const removedUser = Users.findOne({ meetingId, userId }, { extId: 1 });

  if (banUser && removedUser) BannedUsers.add(meetingId, removedUser.extId);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, ejectedBy, payload);
}
