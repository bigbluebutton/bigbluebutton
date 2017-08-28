import RedisPubSub from '/imports/startup/server/redis';
import handleCursorUpdate from './handlers/cursorUpdate';

RedisPubSub.on('presentation_cursor_updated_message', handleCursorUpdate);
