import { check } from 'meteor/check';
import Annotations from '/imports/api/annotations';
import Logger from '/imports/startup/server/logger';

export default function moveAnnotation(meetingId, whiteboardId, shapeId, offset) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(shapeId, String);
  check(offset, Object);

  const selector = {
    meetingId,
    whiteboardId,
    id: shapeId,
  };

  let newAnnotationInfo = Annotations.findOne(selector).annotationInfo;
  if (newAnnotationInfo.type == "text") {
    newAnnotationInfo.x += offset.x;
    newAnnotationInfo.y += offset.y;
  } else {
    const newPoints = newAnnotationInfo.points.map( function(val, idx) {
      if( idx % 2 !== 0 ) {
        return val + offset.y;
      } else {
        return val + offset.x;
      }
    });
    newAnnotationInfo.points = newPoints;
  }

  const modifier = {
    $set: {
      annotationInfo: newAnnotationInfo,
    },
    $inc: {
      version: 1,
    },
  };

  try {
    const numberAffected = Annotations.update(selector, modifier);

    if (numberAffected) {
      Logger.info(`Moved annotation id=${shapeId} offsetX=${offset.x} offsetY=${offset.y} whiteboard=${whiteboardId}`);
    }
  } catch (err) {
    Logger.error(`Moving annotation in collection: ${err}`);
  }
}
