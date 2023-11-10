import { check } from 'meteor/check';

import removeAnnotation from '../modifiers/removeAnnotation';

export default async function handleWhiteboardUndo({ body }, meetingId) {
  const { whiteboardId } = body;
  const shapeId = body.annotationId;

  check(whiteboardId, String);
  check(shapeId, String);

  const result = await removeAnnotation(meetingId, whiteboardId, shapeId);
  return result;
}
