import { check } from 'meteor/check';

import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import reorderAnnotation from '../modifiers/reorderAnnotation';

export default function handleWhiteboardReorderAnnotations({ body }, meetingId) {
  const whiteboardId = body.whiteboardId;
  //const shapeId = body.movedAnnotationId;
  const order = body.order;
  const userId = body.userId;

  check(whiteboardId, String);
  //check(shapeId, String);
  check(userId, String);
  check(order, Array);

  //console.log("order", order);
  const orderInt = order.map(o => {return {position: parseInt(o.position), id: o.id }});
  //console.log("order", orderInt);

  AnnotationsStreamer(meetingId).emit('reordered', { meetingId, whiteboardId, userId, order: orderInt });
  return reorderAnnotation(meetingId, whiteboardId, orderInt);
}
