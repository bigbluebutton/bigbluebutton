import { check } from 'meteor/check';

import clearAnnotations from '../modifiers/clearAnnotations';

export default function handleWhiteboardCleared({ body }, meetingId) {
  const whiteboardId = body.whiteboardId;

  check(whiteboardId, String);

  return clearAnnotations(meetingId, whiteboardId);
}
