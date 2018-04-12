import RedisPubSub from '/imports/startup/server/redis';
import { skipFlashDirectEvent } from '/imports/api/common/server/helpers';
import handleGetWhiteboardAccess from './handlers/getWhiteboardAccess';

RedisPubSub.on('GetWhiteboardAccessRespMsg', skipFlashDirectEvent(handleGetWhiteboardAccess));
RedisPubSub.on('SyncGetWhiteboardAccessRespMsg', handleGetWhiteboardAccess);
RedisPubSub.on('ModifyWhiteboardAccessEvtMsg', handleGetWhiteboardAccess);
