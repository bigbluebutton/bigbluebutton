import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleGuestApproved from './handlers/guestApproved';
import handleGuestsWaitingForApproval from './handlers/guestsWaitingForApproval';

RedisPubSub.on('GuestsWaitingForApprovalEvtMsg', processForHTML5ServerOnly(handleGuestsWaitingForApproval));
RedisPubSub.on('GuestsWaitingApprovedEvtMsg', processForHTML5ServerOnly(handleGuestApproved));
