import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleJoinVoiceUser from './handlers/joinVoiceUser';
import handleLeftVoiceUser from './handlers/leftVoiceUser';
import handleTalkingVoiceUser from './handlers/talkingVoiceUser';
import handleMutedVoiceUser from './handlers/mutedVoiceUser';
import handleGetVoiceUsers from './handlers/getVoiceUsers';
import handleVoiceUsers from './handlers/voiceUsers';
import handleMeetingMuted from './handlers/meetingMuted';

RedisPubSub.on('UserLeftVoiceConfToClientEvtMsg', handleLeftVoiceUser);
RedisPubSub.on('UserJoinedVoiceConfToClientEvtMsg', handleJoinVoiceUser);
RedisPubSub.on('UserTalkingVoiceEvtMsg', handleTalkingVoiceUser);
RedisPubSub.on('UserMutedVoiceEvtMsg', handleMutedVoiceUser);
RedisPubSub.on('GetVoiceUsersMeetingRespMsg', processForHTML5ServerOnly(handleGetVoiceUsers));
RedisPubSub.on('SyncGetVoiceUsersRespMsg', handleVoiceUsers);
RedisPubSub.on('MeetingMutedEvtMsg', handleMeetingMuted);
