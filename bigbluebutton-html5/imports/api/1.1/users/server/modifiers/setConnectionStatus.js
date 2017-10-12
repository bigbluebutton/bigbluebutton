import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Users from '/imports/api/2.0/users';
import Logger from '/imports/startup/server/logger';

const VALID_CONNECTION_STATUS = ['online', 'offline'];

export default function setConnectionStatus(meetingId, userId, status = 'online') {
  check(meetingId, String);
  check(userId, String);
  check(status, String);

  if (!VALID_CONNECTION_STATUS.includes(status)) {
    throw new Meteor.Error('invalid-connection-status',
      `Invalid connection status, received ${status} expecting ${VALID_CONNECTION_STATUS.join()}`);
  }

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      connectionStatus: status,
    },
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating connection status user=${userId}: ${err}`);
    }

    if (numChanged) {
      return Logger.info(`Updated connection status user=${userId} status=${
        status} meeting=${meetingId}`);
    }
  };

  return Users.update(selector, modifier, cb);
}
