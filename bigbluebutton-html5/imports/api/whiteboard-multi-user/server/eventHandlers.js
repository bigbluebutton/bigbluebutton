import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleGetWhiteboardAccess from './handlers/getWhiteboardAccess';

RedisPubSub.on('GetWhiteboardAccessRespMsg', processForHTML5ServerOnly(handleGetWhiteboardAccess));
RedisPubSub.on('SyncGetWhiteboardAccessRespMsg', handleGetWhiteboardAccess);
RedisPubSub.on('ModifyWhiteboardAccessEvtMsg', handleGetWhiteboardAccess);
