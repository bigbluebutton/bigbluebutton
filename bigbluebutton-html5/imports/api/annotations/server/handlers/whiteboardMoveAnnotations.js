import { check } from 'meteor/check';

import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import moveAnnotation from '../modifiers/moveAnnotation';

export default function handleWhiteboardMoveAnnotations({ body }, meetingId) {
  const whiteboardId = body.whiteboardId;
  const shapeId = body.movedAnnotationId;
  const offset = body.offset;
  const userId = body.userId;

  check(whiteboardId, String);
  check(shapeId, String);
  check(userId, String);
  check(offset, Object);

  AnnotationsStreamer(meetingId).emit('moved', { meetingId, whiteboardId, userId, shapeId, offset });
  return moveAnnotation(meetingId, whiteboardId, shapeId, offset);
}
