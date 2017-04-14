import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';

import clearShapesWhiteboard from '../modifiers/clearShapesWhiteboard';

export default function handleWhiteboardCleared({ payload }) {
  const meetingId = payload.meeting_id;
  const whiteboardId = payload.whiteboard_id;

  check(meetingId, String);
  check(whiteboardId, String);

  return clearShapesWhiteboard(meetingId, whiteboardId);
};
