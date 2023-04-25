import { check } from 'meteor/check';

import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import removeAnnotation from '../modifiers/removeAnnotation';

export default async function handleWhiteboardDelete({ body }, meetingId) {
  const { whiteboardId } = body;
  const shapesIds = body.annotationsIds;

  check(whiteboardId, String);
  check(shapesIds, Array);

  const result = await Promise.all(shapesIds.map(async (shapeId) => {
    AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, shapeId });
    await removeAnnotation(meetingId, whiteboardId, shapeId);
  }));
  return result;
}
