import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleModify3dScene from './handlers/modify3dScene';


RedisPubSub.on('PresentationConversionCompletedEvtMsg', handleModify3dScene);
RedisPubSub.on('GetWhiteboardAccessRespMsg', processForHTML5ServerOnly(handleModify3dScene));
RedisPubSub.on('SyncGetWhiteboardAccessRespMsg', handleModify3dScene);
