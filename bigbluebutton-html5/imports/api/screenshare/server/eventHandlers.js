import RedisPubSub from '/imports/startup/server/redis';
import handleScreenshareStarted from './handlers/screenshareStarted';
import handleScreenshareStopped from './handlers/screenshareStopped';
import handleScreenshareSync from './handlers/screenshareSync';

RedisPubSub.on('ScreenshareRtmpBroadcastStartedEvtMsg', handleScreenshareStarted);
RedisPubSub.on('ScreenshareRtmpBroadcastStoppedEvtMsg', handleScreenshareStopped);
RedisPubSub.on('SyncGetScreenshareInfoRespMsg', handleScreenshareSync);
