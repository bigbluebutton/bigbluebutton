import { updateCursorLocation } from './updateCursorLocation';
import { eventEmitter } from '/imports/startup/server';

eventEmitter.on('presentation_cursor_updated_message', function (arg) {
  const meetingId = arg.payload.meeting_id;
  const cursor = {
    x: arg.payload.x_percent,
    y: arg.payload.y_percent,
  };

  // update the location of the cursor on the whiteboard
  updateCursorLocation(meetingId, cursor);
  return arg.callback();
});
