import { check } from 'meteor/check';

export default function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  const {
    id, annotationInfo, wbId, 
  } = annotation;

  const selector = {
    meetingId,
    id,
    userId,
  };

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
