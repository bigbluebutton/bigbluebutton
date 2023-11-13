import { check } from 'meteor/check';

import clearAnnotations from '../modifiers/clearAnnotations';

export default async function handleWhiteboardCleared({ body }, meetingId) {
  check(body, {
    userId: String,
    whiteboardId: String,
    fullClear: Boolean,
  });

  const { whiteboardId, fullClear, userId } = body;

  if (fullClear) {
    const result = await clearAnnotations(meetingId, whiteboardId);
    return result;
  }

  const result = await clearAnnotations(meetingId, whiteboardId, userId);
  return result;
}
