import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import removeShape from '../modifiers/removeShape';

export default function handleWhiteboardUndo({ header, body }) {
  const meetingId = header.meetingId;
  const whiteboardId = body.whiteboardId;
  const shapeId = body.annotationId;

  check(meetingId, String);
  check(whiteboardId, String);
  check(shapeId, String);

  return removeShape(meetingId, whiteboardId, shapeId);
}
