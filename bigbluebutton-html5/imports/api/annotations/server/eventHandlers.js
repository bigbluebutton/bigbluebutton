import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleWhiteboardCleared from './handlers/whiteboardCleared';
import handleWhiteboardModify from './handlers/whiteboardModify';
import handleWhiteboardSend from './handlers/whiteboardSend';
import handleWhiteboardErasedSend from './handlers/whiteboardErased';
import handleWhiteboardAnnotations from './handlers/whiteboardAnnotations';

RedisPubSub.on('ClearWhiteboardEvtMsg', handleWhiteboardCleared);
RedisPubSub.on('ModifyWhiteboardAnnotationEvtMsg', handleWhiteboardModify);
RedisPubSub.on('SendWhiteboardAnnotationEvtMsg', handleWhiteboardSend);
RedisPubSub.on('SendWhiteboardEraserEvtMsg', handleWhiteboardErasedSend);
RedisPubSub.on('GetWhiteboardAnnotationsRespMsg', processForHTML5ServerOnly(handleWhiteboardAnnotations));
