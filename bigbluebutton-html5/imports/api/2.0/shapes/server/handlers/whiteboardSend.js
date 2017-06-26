import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import addShape from '../modifiers/addShape';

export default function handleWhiteboardSend({ header, body }) {
  const meetingId = header.meetingId;
  const shape = body.annotation;

  check(meetingId, String);
  check(shape, Object);

  const whiteboardId = shape.wbId;

  check(whiteboardId, String);

  return addShape(meetingId, whiteboardId, shape);
}
