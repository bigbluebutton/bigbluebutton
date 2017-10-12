import RedisPubSub from '/imports/startup/server/redis';
import handleJoinVoiceUser from './handlers/joinVoiceUser';
import handleLeftVoiceUser from './handlers/leftVoiceUser';
import handleTalkingVoiceUser from './handlers/talkingVoiceUser';
import handleMutedVoiceUser from './handlers/mutedVoiceUser';

RedisPubSub.on('UserLeftVoiceConfToClientEvtMsg', handleLeftVoiceUser);
RedisPubSub.on('UserJoinedVoiceConfToClientEvtMsg', handleJoinVoiceUser);
RedisPubSub.on('UserTalkingVoiceEvtMsg', handleTalkingVoiceUser);
RedisPubSub.on('UserMutedVoiceEvtMsg', handleMutedVoiceUser);
