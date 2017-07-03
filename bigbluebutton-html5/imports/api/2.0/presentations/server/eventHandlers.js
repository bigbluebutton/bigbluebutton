import RedisPubSub from '/imports/startup/server/redis2x';
import handlePresentationChange from './handlers/presentationChange';
import handlePresentationInfoReply from './handlers/presentationInfoReply';

RedisPubSub.on('SyncGetPresentationInfoRespMsg', handlePresentationInfoReply);
RedisPubSub.on('NewPresentationEvtMsg', handlePresentationChange);
