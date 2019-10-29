import RedisPubSub from '/imports/startup/server/redis';
import handleUserSharedHtml5Webcam from './handlers/userSharedHtml5Webcam';
import handleUserUnsharedHtml5Webcam from './handlers/userUnsharedHtml5Webcam';

RedisPubSub.on('UserBroadcastCamStartedEvtMsg', handleUserSharedHtml5Webcam);
RedisPubSub.on('UserBroadcastCamStoppedEvtMsg', handleUserUnsharedHtml5Webcam);
