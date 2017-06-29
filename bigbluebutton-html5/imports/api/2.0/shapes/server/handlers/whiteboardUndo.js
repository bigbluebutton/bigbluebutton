import { check } from 'meteor/check';

import removeShape from '../modifiers/removeShape';

export default function handleWhiteboardUndo(meetingId, { body }) {
  const whiteboardId = body.whiteboardId;
  const shapeId = body.annotationId;

  check(whiteboardId, String);
  check(shapeId, String);

  return removeShape(meetingId, whiteboardId, shapeId);
}
