import RedisPubSub from '/imports/startup/server/redis2x';
import handlePresentationChange from './handlers/presentationChange';
import handlePresentationInfoReply from './handlers/presentationInfoReply';
import handlePresentationRemove from './handlers/presentationRemove';
import handlePresentationCurrentChange from './handlers/presentationCurrentChange';
import handlePresentationConversionUpdate from './handlers/presentationConversionUpdate';

RedisPubSub.on('SyncGetPresentationInfoRespMsg', handlePresentationInfoReply);
RedisPubSub.on('PresentationPageGeneratedEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationConversionUpdateEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationConversionCompletedEvtMsg', handlePresentationChange);
RedisPubSub.on('NewPresentationEvtMsg', handlePresentationChange);
RedisPubSub.on('RemovePresentationEvtMsg', handlePresentationRemove);
RedisPubSub.on('SetCurrentPresentationEvtMsg', handlePresentationCurrentChange);
