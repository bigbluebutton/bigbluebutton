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

  try {
    const { numberAffected } = ConnectionStatus.upsert(selector, modifier);

    if (numberAffected) {
      Logger.verbose(`Updated connection status meetingId=${meetingId} userId=${userId} level=${level}`);
    }
  } catch (err) {
    Logger.error(`Updating connection status meetingId=${meetingId} userId=${userId}: ${err}`);
  }
}
