import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import addShape from '../modifiers/addShape';

export default function handleWhiteboardSend({ payload }) {
  const meetingId = payload.meeting_id;
  const shape = payload.shape;

  check(meetingId, String);
  check(shape, Object);

  const whiteboardId = shape.wb_id;

  check(whiteboardId, String);

  return addShape(meetingId, whiteboardId, shape);
};
