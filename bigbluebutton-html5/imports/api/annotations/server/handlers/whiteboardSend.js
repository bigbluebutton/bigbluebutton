import { check } from 'meteor/check';

import addAnnotation from '../modifiers/addAnnotation';

export default function handleWhiteboardSend({ header, body }, meetingId) {
  const userId = header.userId;
  const annotation = body.annotation;

  check(userId, String);
  check(annotation, Object);

  const whiteboardId = annotation.wbId;

  check(whiteboardId, String);

  return addAnnotation(meetingId, whiteboardId, userId, annotation);
}
