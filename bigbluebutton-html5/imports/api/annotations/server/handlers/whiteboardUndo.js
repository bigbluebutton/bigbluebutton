import { check } from 'meteor/check';

import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import removeAnnotation from '../modifiers/removeAnnotation';

export default function handleWhiteboardUndo({ body }, meetingId) {
  const whiteboardId = body.whiteboardId;
  const shapeId = body.annotationId;

  check(whiteboardId, String);
  check(shapeId, String);

  AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, shapeId });
  return removeAnnotation(meetingId, whiteboardId, shapeId);
}
