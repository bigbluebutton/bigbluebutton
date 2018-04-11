import RedisPubSub from '/imports/startup/server/redis';
import handleGetWhiteboardAccess from './handlers/getWhiteboardAccess';

RedisPubSub.on('GetWhiteboardAccessRespMsg', handleGetWhiteboardAccess);
RedisPubSub.on('SyncGetWhiteboardAccessRespMsg', handleGetWhiteboardAccess);
RedisPubSub.on('ModifyWhiteboardAccessEvtMsg', handleGetWhiteboardAccess);
