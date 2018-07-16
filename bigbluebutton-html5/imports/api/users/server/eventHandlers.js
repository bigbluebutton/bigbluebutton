import RedisPubSub from '/imports/startup/server/redis';
import handleRemoveUser from './handlers/removeUser';
import handleUserJoined from './handlers/userJoined';
import handleValidateAuthToken from './handlers/validateAuthToken';
import handlePresenterAssigned from './handlers/presenterAssigned';
import handleEmojiStatus from './handlers/emojiStatus';
import handleGetUsers from './handlers/getUsers';
import handleGuestsWaitingForApproval from './handlers/guestsWaitingForApproval';
import handleGuestApproved from './handlers/guestApproved';
import handleUserEjected from './handlers/userEjected';
import handleChangeRole from './handlers/changeRole';

RedisPubSub.on('PresenterAssignedEvtMsg', handlePresenterAssigned);
RedisPubSub.on('UserJoinedMeetingEvtMsg', handleUserJoined);
RedisPubSub.on('UserLeftMeetingEvtMsg', handleRemoveUser);
RedisPubSub.on('ValidateAuthTokenRespMsg', handleValidateAuthToken);
RedisPubSub.on('UserEmojiChangedEvtMsg', handleEmojiStatus);
RedisPubSub.on('SyncGetUsersMeetingRespMsg', handleGetUsers);
RedisPubSub.on('GuestsWaitingForApprovalEvtMsg', handleGuestsWaitingForApproval);
RedisPubSub.on('GuestsWaitingApprovedEvtMsg', handleGuestApproved);
RedisPubSub.on('UserEjectedFromMeetingEvtMsg', handleUserEjected);
RedisPubSub.on('UserRoleChangedEvtMsg', handleChangeRole);

