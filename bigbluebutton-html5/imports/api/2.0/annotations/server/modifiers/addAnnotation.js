import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Annotations from '/imports/api/2.0/annotations';

const ANNOTATION_TYPE_TEXT = 'text';
const ANNOTATION_TYPE_PENCIL = 'pencil';

export default function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  const { id, status, annotationType, annotationInfo, wbId, position } = annotation;

  const selector = {
    meetingId,
    id: annotation.id,
    userId,
  };

  const modifier = {
    $set: {
      whiteboardId,
      meetingId,
      id,
      status,
      annotationType,
      annotationInfo,
      wbId,
      position,
    },
    $inc: { version: 1 },
  };

  const shapeType = annotation.annotationType;

  switch (shapeType) {
    case ANNOTATION_TYPE_TEXT:
      modifier.$set.annotationInfo.text = annotation.annotationInfo.text.replace(/[\r]/g, '\n');
      break;
    case ANNOTATION_TYPE_PENCIL:
      // On the draw_end he send us all the points, we don't need to push, we can simple
      // set the new points.
      if (annotation.status !== 'DRAW_END') {
        // We don't want it to be update twice.
        delete modifier.$set.annotationInfo;
        modifier.$push = { 'annotationInfo.points': { $each: annotation.annotationInfo.points } };
      }
      break;
    default:
      break;
  }

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding annotation2x to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added annotation2x id=${annotation.id} whiteboard=${whiteboardId}`);
    }

    return Logger.info(`Upserted annotation2x id=${annotation.id} whiteboard=${whiteboardId}`);
  };

  return Annotations.upsert(selector, modifier, cb);
}
