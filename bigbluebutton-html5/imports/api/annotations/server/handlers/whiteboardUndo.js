import { check } from 'meteor/check';
import removeAnnotation from '../modifiers/removeAnnotation';

export default function handleWhiteboardUndo({ body }, meetingId) {
  const { whiteboardId } = body;
  const shapeId = body.annotationId;

  check(whiteboardId, String);
  check(shapeId, String);

  removeAnnotation(meetingId, whiteboardId, shapeId);
}
