import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import Users from '/imports/api/users';
import GuestUsers from '/imports/api/guest-users'
import { extractCredentials } from '/imports/api/common/server/helpers';

export default function moveUserToGuestLobby(userId) { 
  try {
    const REDIS_CONFIG = Meteor.settings.private.redis;
    const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
    const EVENT_NAME = 'MoveUserToGuestLobbyCmdMsg';

    const { meetingId, requesterUserId: movedToGuestLobbyBy } = extractCredentials(this.userId);

    check(meetingId, String);
    check(movedToGuestLobbyBy, String);
    check(userId, String);

    const User = Users.findOne({
      meetingId,
      userId,
    });

    const payload = {
      userMovedToGuestLobbyId: userId,
      userMovedToGuestLobbyName: User.name,
      movedToGuestLobbyBy,
    };

    Logger.verbose('User moved to guest lobby', { userId, meetingId, movedToGuestLobbyBy });

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, movedToGuestLobbyBy, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method moveUserToGuestLobby ${err.stack}`);
  }
}

