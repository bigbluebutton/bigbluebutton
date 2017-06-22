import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import clearShapesWhiteboard from '../modifiers/clearShapesWhiteboard';

export default function handleWhiteboardCleared({ header, body }) {
  const meetingId = header.meetingId;
  const whiteboardId = body.whiteboardId;

  check(meetingId, String);
  check(whiteboardId, String);

  return clearShapesWhiteboard(meetingId, whiteboardId);
}
