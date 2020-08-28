import RedisPubSub from '/imports/startup/server/redis';
import handleStartExternalVideo from './handlers/startExternalVideo';
import handleStopExternalVideo from './handlers/stopExternalVideo';
import handleUpdateExternalVideo from './handlers/updateExternalVideo';

RedisPubSub.on('StartExternalVideoEvtMsg', handleStartExternalVideo);
RedisPubSub.on('StopExternalVideoEvtMsg', handleStopExternalVideo);
RedisPubSub.on('UpdateExternalVideoEvtMsg', handleUpdateExternalVideo);
