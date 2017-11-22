import RedisPubSub from '/imports/startup/server/redis';
import handleScreenshareStarted from './handlers/screenshareStarted';
import handleScreenshareStopped from './handlers/screenshareStopped';

RedisPubSub.on('ScreenshareRtmpBroadcastStartedEvtMsg', handleScreenshareStarted);
RedisPubSub.on('ScreenshareRtmpBroadcastStoppedEvtMsg', handleScreenshareStopped);
