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
    id,
    userId,
  };

  // annotationInfo will be added to the modifier in switch below, depending on the situation
  const modifier = {
    $set: {
      whiteboardId,
      meetingId,
      id,
      status,
      annotationType,
      wbId,
      position,
    },
    $inc: { version: 1 },
  };

  const shapeType = annotation.annotationType;

  switch (shapeType) {
    case ANNOTATION_TYPE_TEXT:
      // Replace flash new lines to html5 new lines if it's text
      modifier.$set.annotationInfo = annotationInfo;
      modifier.$set.annotationInfo.text = annotation.annotationInfo.text.replace(/[\r]/g, '\n');
      break;
    case ANNOTATION_TYPE_PENCIL:
      // In the pencil draw update we need to add a coordinate to the existing array
      // And update te rest of the properties
      if (annotation.status === 'DRAW_UPDATE') {
        modifier.$set['annotationInfo.color'] = annotationInfo.color;
        modifier.$set['annotationInfo.thickness'] = annotationInfo.thickness;
        modifier.$set['annotationInfo.id'] = annotationInfo.id;
        modifier.$set['annotationInfo.whiteboardId'] = annotationInfo.whiteboardId;
        modifier.$set['annotationInfo.status'] = annotationInfo.status;
        modifier.$set['annotationInfo.transparency'] = annotationInfo.transparency;
        modifier.$push = { 'annotationInfo.points': { $each: annotationInfo.points } };
        break;
      }

      modifier.$set.annotationInfo = annotationInfo;
      break;
    default:
      modifier.$set.annotationInfo = annotationInfo;
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
