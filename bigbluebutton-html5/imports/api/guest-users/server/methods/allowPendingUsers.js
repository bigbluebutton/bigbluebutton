import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';

const REDIS_CONFIG = Meteor.settings.private.redis;
const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
const EVENT_NAME = 'GuestsWaitingApprovedMsg';

export default function allowPendingUsers(credentials, guests, status) {
  const {
    meetingId,
    requesterUserId,
    requesterToken,
  } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);
  check(guests, Array);
  const mappedGuests = guests.map(guest => ({ status, guest: guest.intId }));

  const payload = {
    approvedBy: requesterUserId,
    guests: mappedGuests,
  };
  

  Logger.info(`User=${requesterUserId} ${status} guests ${JSON.stringify(mappedGuests)}`);

  return RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
}
