import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default function ping(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  const selector = {
    meetingId,
    userId: requesterUserId,
  };

  const modifier = {
    $set: {
      lastPing: Date.now(),
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Error updating lastPing for ${requesterUserId}: ${err}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
