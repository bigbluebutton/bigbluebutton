import RedisPubSub from '/imports/startup/server/redis';
import handlePresentationAdded from './handlers/presentationAdded';
import handlePresentationInfoReply from './handlers/presentationInfoReply';
import handlePresentationRemove from './handlers/presentationRemove';
import handlePresentationCurrentSet from './handlers/presentationCurrentSet';
import handlePresentationConversionUpdate from './handlers/presentationConversionUpdate';

RedisPubSub.on('SyncGetPresentationInfoRespMsg', handlePresentationInfoReply);
RedisPubSub.on('PresentationPageGeneratedEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationPageCountErrorEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationConversionUpdateEvtMsg', handlePresentationConversionUpdate);
RedisPubSub.on('PresentationConversionCompletedEvtMsg', handlePresentationAdded);
RedisPubSub.on('RemovePresentationEvtMsg', handlePresentationRemove);
RedisPubSub.on('SetCurrentPresentationEvtMsg', handlePresentationCurrentSet);
