import { check } from 'meteor/check';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';

export default function setConnectionId(meetingId, userId, connectionId, authToken) {
  check(meetingId, String);
  check(userId, String);
  check(authToken, String);
  check(connectionId, String);

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      connectionId,
      authToken,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      Logger.error(`Updating connectionId user=${userId}: ${err}`);
      return;
    }

    if (numChanged) {
      Logger.info(`Updated connectionId user=${userId} connectionId=${connectionId} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
