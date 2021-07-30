import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import updateConnectionStatus from '/imports/api/connection-status/server/modifiers/updateConnectionStatus';
import { extractCredentials } from '/imports/api/common/server/helpers';

const STATS = Meteor.settings.public.stats;

const logConnectionStatus = (meetingId, userId, status, type, value) => {
  switch (status) {
    case 'normal':
      Logger.info(`Connection status updated: meetingId=${meetingId} userId=${userId} status=${status} type=${type}`);
      break;
    case 'warning':
    case 'danger':
    case 'critical':
      switch (type) {
        case 'audio': {
          const {
            jitter,
            loss,
          } = value;
          Logger.info(`Connection status updated: meetingId=${meetingId} userId=${userId} status=${status} type=${type} jitter=${jitter} loss=${loss}`);
          break;
        }
        case 'socket': {
          const { rtt } = value;
          Logger.info(`Connection status updated: meetingId=${meetingId} userId=${userId} status=${status} type=${type} rtt=${rtt}`);
          break;
        }
        default:
      }
      break;
    default:
  }
};

export default function addConnectionStatus(status, type, value) {
  try {
    check(status, String);
    check(type, String);
    check(value, Object);

    if (!this.userId) return;

    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);

    if (STATS.log) logConnectionStatus(meetingId, requesterUserId, status, type, value);

    // Avoid storing recoveries
    if (status !== 'normal') {
      updateConnectionStatus(meetingId, requesterUserId, status);
    }
  } catch (err) {
    Logger.error(`Exception while invoking method addConnectionStatus ${err.stack}`);
  }
}
