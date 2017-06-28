import { check } from 'meteor/check';

import clearShapesWhiteboard from '../modifiers/clearShapesWhiteboard';

export default function handleWhiteboardCleared(meetingId, { body }) {
  const whiteboardId = body.whiteboardId;

  check(whiteboardId, String);

  return clearShapesWhiteboard(meetingId, whiteboardId);
}
