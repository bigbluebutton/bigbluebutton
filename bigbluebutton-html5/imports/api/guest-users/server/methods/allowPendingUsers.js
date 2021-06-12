import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

const REDIS_CONFIG = Meteor.settings.private.redis;
const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
const EVENT_NAME = 'GuestsWaitingApprovedMsg';

export default function allowPendingUsers(guests, status) {
  try {
    const { meetingId, requesterUserId } = extractCredentials(this.userId);

    check(meetingId, String);
    check(requesterUserId, String);
    check(guests, Array);
    const mappedGuests = guests.map((guest) => ({ status, guest: guest.intId }));

    const payload = {
      approvedBy: requesterUserId,
      guests: mappedGuests,
    };

    Logger.info(`User=${requesterUserId} ${status} guests ${JSON.stringify(mappedGuests)}`);

    RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, requesterUserId, payload);
  } catch (err) {
    Logger.error(`Exception while invoking method allowPendingUsers ${err.stack}`);
  }
}
