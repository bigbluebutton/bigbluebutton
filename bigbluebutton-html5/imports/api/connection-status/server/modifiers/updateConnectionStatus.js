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
    meetingId,
    userId,
    level,
    timestamp,
  };

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Updating connection status: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added connection status userId=${userId} level=${level}`);
    }

    return Logger.verbose(`Update connection status userId=${userId} level=${level}`);
  };

  return ConnectionStatus.upsert(selector, modifier, cb);
}
