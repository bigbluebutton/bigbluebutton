import { check } from 'meteor/check';
import AnnotationsStreamer from '/imports/api/annotations/server/streamer';

import clearAnnotations from '../modifiers/clearAnnotations';

export default function handleWhiteboardCleared({ body }, meetingId) {
  check(body, {
    userId: String,
    whiteboardId: String,
    fullClear: Boolean,
  });

  const { whiteboardId, fullClear, userId } = body;

  if (fullClear) {
    AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId });
    return clearAnnotations(meetingId, whiteboardId);
  }

  AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, userId });
  return clearAnnotations(meetingId, whiteboardId, userId);
}
