import RedisPubSub from '/imports/startup/server/redis';
import handleGuestApproved from './handlers/guestApproved';
import handleGuestsWaitingForApproval from './handlers/guestsWaitingForApproval';

RedisPubSub.on('GuestsWaitingForApprovalEvtMsg', handleGuestsWaitingForApproval);
RedisPubSub.on('GuestsWaitingApprovedEvtMsg', handleGuestApproved);
