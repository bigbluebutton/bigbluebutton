import { check } from 'meteor/check';

import clearAnnotationsWhiteboard from '../modifiers/clearAnnotationsWhiteboard';

export default function handleWhiteboardCleared({ body }, meetingId) {
  const whiteboardId = body.whiteboardId;

  check(whiteboardId, String);

  return clearAnnotationsWhiteboard(meetingId, whiteboardId);
}
