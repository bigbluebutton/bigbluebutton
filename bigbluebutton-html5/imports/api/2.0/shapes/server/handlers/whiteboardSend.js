import { check } from 'meteor/check';

import addShape from '../modifiers/addShape';

export default function handleWhiteboardSend({ header, body }, meetingId) {
  const userId = header.userId;
  const shape = body.annotation;

  check(userId, String);
  check(shape, Object);

  const whiteboardId = shape.wbId;

  check(whiteboardId, String);

  return addShape(meetingId, whiteboardId, userId, shape);
}
