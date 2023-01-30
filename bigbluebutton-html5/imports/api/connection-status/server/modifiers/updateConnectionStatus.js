import ConnectionStatus from '/imports/api/connection-status';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import changeHasConnectionStatus from '/imports/api/users-persistent-data/server/modifiers/changeHasConnectionStatus';

export default function updateConnectionStatus(meetingId, userId, status) {
  check(meetingId, String);
  check(userId, String);

  const now = new Date().getTime();

  const selector = {
    meetingId,
    userId,
  };

  const modifier = {
    meetingId,
    userId,
    connectionAliveAt: now,
  };

  // Store last not-normal status
  if (status !== 'normal') {
    modifier.status = status;
    modifier.statusUpdatedAt = now;
  }

  try {
    const { numberAffected } = ConnectionStatus.upsert(selector, { $set: modifier });
    if (numberAffected && status !== 'normal') {
      changeHasConnectionStatus(true, userId, meetingId);
      Logger.verbose(`Updated connection status meetingId=${meetingId} userId=${userId} status=${status}`);
    }
  } catch (err) {
    Logger.error(`Updating connection status meetingId=${meetingId} userId=${userId}: ${err}`);
  }
}
