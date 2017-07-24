import RedisPubSub from '/imports/startup/server/redis';
import handleWhiteboardGetReply from './handlers/whiteboardGetReply';
import handleWhiteboardSend from './handlers/whiteboardSend';
import handleWhiteboardCleared from './handlers/whiteboardCleared';
import handleWhiteboardUndo from './handlers/whiteboardUndo';

RedisPubSub.on('get_whiteboard_shapes_reply', handleWhiteboardGetReply);
RedisPubSub.on('send_whiteboard_shape_message', handleWhiteboardSend);
RedisPubSub.on('whiteboard_cleared_message', handleWhiteboardCleared);
RedisPubSub.on('undo_whiteboard_request', handleWhiteboardUndo);
