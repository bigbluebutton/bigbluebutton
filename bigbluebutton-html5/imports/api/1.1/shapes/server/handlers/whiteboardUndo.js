import { check } from 'meteor/check';

import removeAnnotation from '../modifiers/removeAnnotation';

export default function handleWhiteboardUndo({ body }, meetingId) {
  const whiteboardId = body.whiteboardId;
  const shapeId = body.annotationId;

  check(whiteboardId, String);
  check(shapeId, String);

  return removeAnnotation(meetingId, whiteboardId, shapeId);
}
