import _ from 'lodash';
import { check } from 'meteor/check';
import Annotations from '/imports/api/2.0/annotations';
import addAnnotation from '../modifiers/addAnnotation';
import removeAnnotation from '../modifiers/removeAnnotation';

export default function handleWhiteboardAnnotations({ body }, meetingId) {
  check(meetingId, String);
  check(body, Object);

  const { annotations, whiteboardId } = body;
  const annotationIds = annotations.map(a => a.id);
  const annotationsToRemove = Annotations.find({
    meetingId,
    wbId: whiteboardId,
    'annotationInfo.id': { $nin: annotationIds },
  }).fetch();

  _.each(annotationsToRemove, (annotation) => {
    removeAnnotation(meetingId, annotation.whiteboardId, annotation.annotationInfo.id);
  });

  const annotationsAdded = [];
  _.each(annotations, (annotation) => {
    const { wbId, userId } = annotation;
    annotationsAdded.push(addAnnotation(meetingId, wbId, userId, annotation));
  });

  return annotationsAdded;
}
