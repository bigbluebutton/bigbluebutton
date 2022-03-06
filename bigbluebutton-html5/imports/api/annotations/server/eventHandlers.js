import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleWhiteboardCleared from './handlers/whiteboardCleared';
import handleWhiteboardRemoveAnnotations from './handlers/whiteboardRemoveAnnotations';
import handleWhiteboardMoveAnnotations from './handlers/whiteboardMoveAnnotations';
import handleWhiteboardReorderAnnotations from './handlers/whiteboardReorderAnnotations';
import handleWhiteboardUndo from './handlers/whiteboardUndo';
import handleWhiteboardSend from './handlers/whiteboardSend';
import handleWhiteboardAnnotations from './handlers/whiteboardAnnotations';

RedisPubSub.on('ClearWhiteboardEvtMsg', handleWhiteboardCleared);
RedisPubSub.on('RemoveWhiteboardAnnotationsEvtMsg', handleWhiteboardRemoveAnnotations);
RedisPubSub.on('MoveWhiteboardAnnotationsEvtMsg', handleWhiteboardMoveAnnotations);
RedisPubSub.on('ReorderWhiteboardAnnotationsEvtMsg', handleWhiteboardReorderAnnotations);
RedisPubSub.on('UndoWhiteboardEvtMsg', handleWhiteboardUndo);
RedisPubSub.on('SendWhiteboardAnnotationEvtMsg', handleWhiteboardSend);
RedisPubSub.on('GetWhiteboardAnnotationsRespMsg', processForHTML5ServerOnly(handleWhiteboardAnnotations));
