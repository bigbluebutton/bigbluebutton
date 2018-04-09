import RedisPubSub from '/imports/startup/server/redis';
import handleModifyWhiteboardAccess from './handlers/modifyWhiteboardAccess';

RedisPubSub.on('ModifyWhiteboardAccessEvtMsg', handleModifyWhiteboardAccess);
