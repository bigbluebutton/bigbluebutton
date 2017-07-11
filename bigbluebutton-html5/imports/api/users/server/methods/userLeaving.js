import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { isAllowedTo } from '/imports/startup/server/userPermissions';
import Users from '/imports/api/users';
import Meetings from '/imports/api/meetings';

import setConnectionStatus from '../modifiers/setConnectionStatus';
import listenOnlyToggle from './listenOnlyToggle';

const OFFLINE_CONNECTION_STATUS = 'offline';

export default function userLeaving(credentials, userId) {
  const REDIS_CONFIG = Meteor.settings.redis;
  const CHANNEL = REDIS_CONFIG.channels.toBBBApps.users;
  const EVENT_NAME = 'user_leaving_request';

  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(userId, String);

  const selector = {
    meetingId,
    userId,
  };

  const User = Users.findOne(selector);
  const Meeting = Meetings.findOne({ meetingId: meetingId });

  if(Meeting) {

    if (!User) {
      throw new Meteor.Error(
        'user-not-found', `Could not find ${userId} in ${meetingId}: cannot complete userLeaving`);
    }

    if (User.user.connection_status === OFFLINE_CONNECTION_STATUS) {
      return;
    }

    if (User.user.listenOnly) {
      listenOnlyToggle(credentials, false);
    }

    if (User.validated) {
      const modifier = {
        $set: {
          validated: null,
        },
      };

      const cb = (err, numChanged) => {
        if (err) {
          return Logger.error(`Invalidating user: ${err}`);
        }

        if (numChanged) {
          return Logger.info(`Invalidate user=${userId} meeting=${meetingId}`);
        }
      };

      Users.update(selector, modifier, cb);
    }

  }

  const payload = {
    meeting_id: meetingId,
    userid: userId,
  };

  Logger.verbose(`User '${requesterUserId}' left meeting '${meetingId}'`);
  return RedisPubSub.publish(CHANNEL, EVENT_NAME, payload);
}
