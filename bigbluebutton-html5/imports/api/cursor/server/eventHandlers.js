import RedisPubSub from '/imports/startup/server/redis';
import handleCursorUpdate from './handlers/cursorUpdate';

RedisPubSub.on('SendCursorPositionEvtMsg', handleCursorUpdate);
