import ConnectionStatus from '/imports/api/connection-status';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

export default function updateConnectionStatus(meetingId, userId, level) {
  check(meetingId, String);
  check(userId, String);

  const timestamp = new Date().getTime();

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    $set: {
      level,
      timestamp,
    },
  };

  const cb = (err) => {
    if (err) {
      return Logger.error(`Updating connection status: ${err}`);
    }

    return Logger.verbose(`Update connection status userId=${userId} level=${level}`);
  };

  return ConnectionStatus.update(selector, modifier, cb);
}
