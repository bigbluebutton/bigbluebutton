import { check } from 'meteor/check';

import clearAnnotations from '../modifiers/clearAnnotations';

export default function handleWhiteboardCleared({ body }, meetingId) {
  check(body, {
    userId: String,
    whiteboardId: String,
    fullClear: Boolean,
  });

  const { whiteboardId, fullClear, userId } = body;

  if (fullClear) {
    return clearAnnotations(meetingId, whiteboardId);
  }

  return clearAnnotations(meetingId, whiteboardId, userId);
}
