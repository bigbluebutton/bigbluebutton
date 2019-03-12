import RedisPubSub from '/imports/startup/server/redis';
import handleGuestApproved from './handlers/guestApproved';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleGuestsWaitingForApproval from './handlers/guestsWaitingForApproval';

RedisPubSub.on('GetGuestsWaitingApprovalRespMsg', processForHTML5ServerOnly(handleGuestsWaitingForApproval));
RedisPubSub.on('GuestsWaitingForApprovalEvtMsg', handleGuestsWaitingForApproval);
RedisPubSub.on('GuestsWaitingApprovedEvtMsg', handleGuestApproved);
