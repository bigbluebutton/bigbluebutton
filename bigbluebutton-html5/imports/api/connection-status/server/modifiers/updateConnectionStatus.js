import ConnectionStatus from '/imports/api/connection-status';
import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import changeHasConnectionStatus from '/imports/api/users-persistent-data/server/modifiers/changeHasConnectionStatus';

const STATS = Meteor.settings.public.stats;
const STATS_INTERVAL = STATS.interval;
const STATS_CRITICAL_RTT = STATS.rtt[STATS.rtt.length - 1];

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
    clientNotResponding: false,
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

    Meteor.setTimeout(() => {
      const connectionLossTimeThreshold = new Date().getTime() - (STATS_INTERVAL + STATS_CRITICAL_RTT);

      const selectorNotResponding = {
        meetingId,
        userId,
        connectionAliveAt: { $lte: connectionLossTimeThreshold },
        clientNotResponding: false,
      };

      const numberAffectedNotResponding = ConnectionStatus.update(selectorNotResponding, {
        $set: { clientNotResponding: true }
      });

      if (numberAffectedNotResponding) {
        Logger.info(`Updated clientNotResponding=true meetingId=${meetingId} userId=${userId}`);
      }
    }, STATS_INTERVAL + STATS_CRITICAL_RTT);

  } catch (err) {
    Logger.error(`Updating connection status meetingId=${meetingId} userId=${userId}: ${err}`);
  }
}
