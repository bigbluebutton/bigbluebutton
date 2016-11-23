import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';

import addShape from '../modifiers/addShape';

export default function handleWhiteboardGetReply({ payload }) {
  if (!inReplyToHTML5Client({ payload })) {
    return;
  }

  const meetingId = payload.meeting_id;
  const shapes = payload.shapes;

  check(meetingId, String);
  check(shapes, Array);

  let shapesAdded = [];
  shapes.forEach(shape => {
    let whiteboardId = shape.wb_id;
    shapesAdded.push(addShape(meetingId, whiteboardId, shape));
  });

  return shapesAdded;
};
