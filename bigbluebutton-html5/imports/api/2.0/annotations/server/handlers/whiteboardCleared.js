import { check } from 'meteor/check';

import clearAnnotations from '../modifiers/clearAnnotations';

export default function handleWhiteboardCleared({ body }, meetingId) {
  check(body, {
    userId: String,
    whiteboardId: String,
    fullClear: Boolean,
  });

  const whiteboardId = body.whiteboardId;
  const fullClear = body.fullClear;
  const userId = body.userId;

  return clearAnnotations(meetingId, whiteboardId, userId, fullClear);
}
