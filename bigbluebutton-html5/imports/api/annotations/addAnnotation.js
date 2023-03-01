import { check } from 'meteor/check';
import { defaultsDeep } from '/imports/utils/array-utils';

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
    annotationInfo = defaultsDeep(annotationInfo, oldAnnotation.annotationInfo);
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
