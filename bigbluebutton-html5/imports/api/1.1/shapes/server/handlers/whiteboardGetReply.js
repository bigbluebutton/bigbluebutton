import Logger from '/imports/startup/server/logger';
import { check } from 'meteor/check';
import { inReplyToHTML5Client } from '/imports/api/common/server/helpers';
import Shapes from './../../';

import addShape from '../modifiers/addShape';
import removeShape from '../modifiers/removeShape';

export default function handleWhiteboardGetReply({ payload }) {
  if (!inReplyToHTML5Client({ payload })) {
    return;
  }

  const meetingId = payload.meeting_id;
  const shapes = payload.shapes;

  check(meetingId, String);
  check(shapes, Array);

  const shapesIds = shapes.map(_ => _.id);
  const shapesToRemove = Shapes.find({
    meetingId,
    'shape.id': { $nin: shapesIds },
  }).fetch();

  shapesToRemove.forEach(s => removeShape(meetingId, s.shape.wb_id, s.shape.id));

  const shapesAdded = [];
  shapes.forEach((shape) => {
    const whiteboardId = shape.wb_id;
    shapesAdded.push(addShape(meetingId, whiteboardId, shape));
  });

  return shapesAdded;
}
