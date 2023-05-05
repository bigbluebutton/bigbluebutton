import { check } from 'meteor/check';

import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import removeAnnotation from '../modifiers/removeAnnotation';

export default function handleWhiteboardDelete({ body }, meetingId) {
  const whiteboardId = body.whiteboardId;
  const shapesIds = body.annotationsIds;

  check(whiteboardId, String);
  check(shapesIds, Array);
  
  //console.log("!!!!!!!!!!!! handleWhiteboardDelete !!!!!!!!!!!!!!!!!",shapesIds)
  shapesIds.map(shapeId => {
    AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, shapeId });
    removeAnnotation(meetingId, whiteboardId, shapeId);
  })
}
