import RedisPubSub from '/imports/startup/server/redis';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { extractCredentials } from '/imports/api/common/server/helpers';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default function changeWhiteboardAccess(multiUser, whiteboardId, userId = '') {
  const REDIS_CONFIG = Meteor.settings.private.redis;
  const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
  const EVENT_NAME = 'ModifyWhiteboardAccessPubMsg';

  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(multiUser, Boolean);
  check(whiteboardId, String);
  check(userId, String);

  const payload = {
    multiUser,
    whiteboardId,
  };

  const selector = {
    meetingId,
    connectionStatus: 'online',
  };

  const mod = {
    $set: {
      whiteboardAccess: false,
    },
  };

  const withUserId = userId.length > 0;

  if ((!multiUser || multiUser) && !withUserId) {
    if (!multiUser) {
      selector.whiteboardAccess = true;
      selector.presenter = { $ne: true };
    } else {
      mod.$set.whiteboardAccess = true;
    }

    Users.update(selector, mod, { multi: true }, (err) => {
      if (err) {
        return Logger.error(`Error setting multiple whiteboard access, User collection: ${err}`);
      }
      return Logger.info(`updated Users whiteboardAccess flag=${multiUser} meetingId=${meetingId}`);
    });
  }

  if ((multiUser || !multiUser) && withUserId) {
    selector.userId = userId;

    if (multiUser) {
      mod.$set.whiteboardAccess = true;
    }

    const usersWithAccess = Users.find({
      meetingId,
      whiteboardAccess: true,
      connectionStatus: 'online',
      presenter: { $ne: true },
    }, {
      fields: {
        id: 1,
      },
    }).fetch().length;

    Users.update(selector, mod, (err) => {
      if (err) {
        return Logger.error(`Error setting whiteboard access, User collection: ${err}`);
      }
      return Logger.info(`updated User whiteboardAccess flag=${multiUser} meetingId=${meetingId} userId=${userId}`);
    });
    
    if (usersWithAccess > 1) return
  }

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
