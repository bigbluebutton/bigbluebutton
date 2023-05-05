import { check } from 'meteor/check';
import _ from 'lodash';

export default function addAnnotation(meetingId, whiteboardId, userId, annotation, Annotations) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  const {
    id, wbId,
  } = annotation;

  let { annotationInfo } = annotation;

  const selector = {
    meetingId,
    id,
  };

  const oldAnnotation = Annotations.findOne(selector);
  if (oldAnnotation) {
    annotationInfo = _.merge(oldAnnotation.annotationInfo, annotationInfo);
  }

  const modifier = {
    $set: {
      whiteboardId,
      meetingId,
      id,
      annotationInfo,
      wbId,
    },
  };

  return { selector, modifier };
}
