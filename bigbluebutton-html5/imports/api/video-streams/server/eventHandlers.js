import RedisPubSub from '/imports/startup/server/redis';
import handleUserSharedHtml5Webcam from './handlers/userSharedHtml5Webcam';
import handleUserUnsharedHtml5Webcam from './handlers/userUnsharedHtml5Webcam';
import handleFloorChanged from './handlers/floorChanged';

RedisPubSub.on('UserBroadcastCamStartedEvtMsg', handleUserSharedHtml5Webcam);
RedisPubSub.on('UserBroadcastCamStoppedEvtMsg', handleUserUnsharedHtml5Webcam);
RedisPubSub.on('AudioFloorChangedEvtMsg', handleFloorChanged);
