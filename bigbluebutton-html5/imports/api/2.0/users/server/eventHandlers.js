import RedisPubSub from '/imports/startup/server/redis2x';
import handleRemoveUser from './handlers/removeUser';
import handleUserJoined from './handlers/userJoined';
import handleValidateAuthToken from './handlers/validateAuthToken';
import handleVoiceUpdate from './handlers/voiceUpdate';
import handlePresenterAssigned from './handlers/presenterAssigned';
import handleEmojiStatus from './handlers/emojiStatus';

RedisPubSub.on('PresenterAssignedEvtMsg', handlePresenterAssigned);
RedisPubSub.on('UserJoinedMeetingEvtMsg', handleUserJoined);
RedisPubSub.on('UserLeftMeetingEvtMsg', handleRemoveUser);
RedisPubSub.on('UserLeftVoiceConfToClientEvtMsg', handleVoiceUpdate);
RedisPubSub.on('UserJoinedVoiceConfToClientEvtMsg', handleVoiceUpdate);
RedisPubSub.on('ValidateAuthTokenRespMsg', handleValidateAuthToken);
RedisPubSub.on('UserEmojiChangedEvtMsg', handleEmojiStatus);
