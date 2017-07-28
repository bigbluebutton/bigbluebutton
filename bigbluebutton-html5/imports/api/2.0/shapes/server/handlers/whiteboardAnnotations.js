import Logger from '/imports/startup/server/logger';
import _ from 'lodash';
import { check } from 'meteor/check';
import Shapes from '/imports/api/2.0/shapes';
import addShape from '../modifiers/addShape';
import removeShape from '../modifiers/removeShape';

export default function handleWhiteboardAnnotations({ body }, meetingId) {

  check(meetingId, String);
  check(body, Object);

  const { annotations, whiteboardId } = body;
  const annotationIds = annotations.map(_ => _.id);
  const annotationsToRemove = Shapes.find({
    meetingId,
    'shape.wb_id': whiteboardId,
    'shape.id': { $nin: annotationIds },
  }).fetch();

  _.each(annotationsToRemove, (s) => {
    removeShape(meetingId, s.whiteboardId, s.shape.id);
  });

  const annotationsAdded = [];
  _.each(annotations, (annotation) => {
    const whiteboardId = annotation.wbId;
    const userId = annotation.userId;
    annotationsAdded.push(addShape(meetingId, whiteboardId, userId, annotation));
  });

  return annotationsAdded;
}
