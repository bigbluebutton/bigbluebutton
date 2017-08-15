import { check } from 'meteor/check';

import clearShapesWhiteboard from '../modifiers/clearShapesWhiteboard';

export default function handleWhiteboardCleared({ body }, meetingId) {
  check(body, {
    userId: String,
    whiteboardId: String,
    fullClear: Boolean,
  });

  const whiteboardId = body.whiteboardId;
  const fullClear = body.fullClear;
  const userId = body.userId;

  return clearShapesWhiteboard(meetingId, whiteboardId, userId, fullClear);
}
