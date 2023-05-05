import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import RedisPubSub from '/imports/startup/server/redis';
import Logger from '/imports/startup/server/logger';
import GuestUsers from '/imports/api/guest-users/';


const REDIS_CONFIG = Meteor.settings.private.redis;
const CHANNEL = REDIS_CONFIG.channels.toAkkaApps;
const EVENT_NAME = 'UpdatePositionInWaitingQueueReqMsg';

export default function updatePositionInWaitingQueue(meetingId) {

    check(meetingId, String); 

    const guestUsers = GuestUsers.find({
        meetingId: meetingId,
        approved: false,
        denied: false,
    }).fetch();
    
    check(guestUsers, Array);
    try {

        const guests = guestUsers.map(guest => ({intId: guest.intId, idx: String(guestUsers.indexOf(guest)+1)}));
        check(guests, Array);
        const payload = { guests };

        Logger.info(`The waiting positions of the guest users will be updated`);
        RedisPubSub.publishUserMessage(CHANNEL, EVENT_NAME, meetingId, "not-used", payload);
    } catch (err) {
        Logger.error(`Exception while invoking method updatePositionInWaitingQueue ${err.stack}`);
    }
}
    