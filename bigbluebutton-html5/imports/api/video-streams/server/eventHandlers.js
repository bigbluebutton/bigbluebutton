import RedisPubSub from '/imports/startup/server/redis';
import handleUserSharedHtml5Webcam from './handlers/userSharedHtml5Webcam';
import handleUserUnsharedHtml5Webcam from './handlers/userUnsharedHtml5Webcam';
import handleFloorChanged from './handlers/floorChanged';
import handlePinnedChanged from './handlers/userPinChanged';
import handleWebcamSync from './handlers/webcamSync';

RedisPubSub.on('UserBroadcastCamStartedEvtMsg', handleUserSharedHtml5Webcam);
RedisPubSub.on('UserBroadcastCamStoppedEvtMsg', handleUserUnsharedHtml5Webcam);
RedisPubSub.on('AudioFloorChangedEvtMsg', handleFloorChanged);
RedisPubSub.on('UserPinStateChangedEvtMsg', handlePinnedChanged);
RedisPubSub.on('SyncGetWebcamInfoRespMsg', handleWebcamSync);
