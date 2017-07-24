import RedisPubSub from '/imports/startup/server/redis2x';
import handleBroadcastStartedVoice from './handlers/broadcastStartedVoice';
import handleBroadcastStarted from './handlers/broadcastStarted';
import handleBroadcastStoppedVoice from './handlers/broadcastStoppedVoice';
import handleBroadcastStopped from './handlers/broadcastStopped';
import handleStartedVoice from './handlers/startedVoice';
import handleStoppedVoice from './handlers/stoppedVoice';

RedisPubSub.on('ScreenshareRtmpBroadcastStartedVoiceConfEvtMsg', handleBroadcastStartedVoice);
RedisPubSub.on('ScreenshareRtmpBroadcastStartedEvtMsg', handleBroadcastStarted);
RedisPubSub.on('ScreenshareRtmpBroadcastStoppedVoiceConfEvtMsg', handleBroadcastStoppedVoice);
RedisPubSub.on('ScreenshareRtmpBroadcastStoppedEvtMsg', handleBroadcastStopped);
RedisPubSub.on('ScreenshareStartedVoiceConfEvtMsg', handleStartedVoice);
RedisPubSub.on('ScreenshareStoppedVoiceConfEvtMsg', handleStoppedVoice);
