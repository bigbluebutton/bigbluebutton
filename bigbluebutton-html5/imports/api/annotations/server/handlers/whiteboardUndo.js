import { check } from 'meteor/check';

import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import removeAnnotation from '../modifiers/removeAnnotation';

export default async function handleWhiteboardUndo({ body }, meetingId) {
  const { whiteboardId } = body;
  const shapeId = body.annotationId;

  check(whiteboardId, String);
  check(shapeId, String);

  AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, shapeId });
  const result = await removeAnnotation(meetingId, whiteboardId, shapeId);
  return result;
}
