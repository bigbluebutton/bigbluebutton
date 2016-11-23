import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import removeShape from '../modifiers/removeShape';

export default function handleWhiteboardUndo({ payload }) {
  const meetingId = payload.meeting_id;
  const whiteboardId = payload.whiteboard_id;
  const shapeId = payload.shape_id;

  check(meetingId, String);
  check(whiteboardId, String);
  check(shapeId, String);

  return removeShape(meetingId, whiteboardId, shapeId);
};
