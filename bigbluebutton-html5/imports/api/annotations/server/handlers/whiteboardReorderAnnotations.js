import { check } from 'meteor/check';

import AnnotationsStreamer from '/imports/api/annotations/server/streamer';
import reorderAnnotation from '../modifiers/reorderAnnotation';

export default function handleWhiteboardReorderAnnotations({ body }, meetingId) {
  const whiteboardId = body.whiteboardId;
  const order = body.order;
  const userId = body.userId;

  check(whiteboardId, String);
  check(userId, String);
  check(order, Array);

  const orderInt = order.map(o => {return {position: parseInt(o.position), id: o.id }});

  AnnotationsStreamer(meetingId).emit('reordered', { meetingId, whiteboardId, userId, order: orderInt });
  return reorderAnnotation(meetingId, whiteboardId, orderInt);
}
