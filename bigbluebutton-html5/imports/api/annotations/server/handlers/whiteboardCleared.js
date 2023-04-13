import { check } from 'meteor/check';
import AnnotationsStreamer from '/imports/api/annotations/server/streamer';

import clearAnnotations from '../modifiers/clearAnnotations';

export default async function handleWhiteboardCleared({ body }, meetingId) {
  check(body, {
    userId: String,
    whiteboardId: String,
    fullClear: Boolean,
  });

  const { whiteboardId, fullClear, userId } = body;

  if (fullClear) {
    AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId });
    const result = await clearAnnotations(meetingId, whiteboardId);
    return result;
  }

  AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, userId });
  const result = await clearAnnotations(meetingId, whiteboardId, userId);
  return result;
}
