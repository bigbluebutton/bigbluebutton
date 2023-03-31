import RedisPubSub from '/imports/startup/server/redis';
import { processForHTML5ServerOnly } from '/imports/api/common/server/helpers';
import handleWhiteboardCleared from './handlers/whiteboardCleared';
import handleWhiteboardDelete from './handlers/whiteboardDelete';
import handleWhiteboardSend from './handlers/whiteboardSend';
import handleWhiteboardAnnotations from './handlers/whiteboardAnnotations';

RedisPubSub.on('ClearWhiteboardEvtMsg', handleWhiteboardCleared);
RedisPubSub.on('DeleteWhiteboardAnnotationsEvtMsg', handleWhiteboardDelete);
RedisPubSub.on('SendWhiteboardAnnotationsEvtMsg', handleWhiteboardSend);
RedisPubSub.on('GetWhiteboardAnnotationsRespMsg', processForHTML5ServerOnly(handleWhiteboardAnnotations));
