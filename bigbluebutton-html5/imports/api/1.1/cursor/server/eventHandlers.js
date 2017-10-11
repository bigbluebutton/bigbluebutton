import RedisPubSub from '/imports/startup/server/redis2x';
import handleCursorUpdate from './handlers/cursorUpdate';

RedisPubSub.on('SendCursorPositionEvtMsg', handleCursorUpdate);
