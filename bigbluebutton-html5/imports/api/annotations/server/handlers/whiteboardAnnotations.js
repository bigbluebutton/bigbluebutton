import { check } from 'meteor/check';
import modifyWhiteboardAccess from '/imports/api/whiteboard-multi-user/server/modifiers/modifyWhiteboardAccess';
import clearAnnotations from '../modifiers/clearAnnotations';
import addAnnotation from '../modifiers/addAnnotation';

async function handleWhiteboardAnnotations({ header, body }, meetingId) {
  check(header, Object);
  if (header.userId !== 'nodeJSapp') { return false; }

  check(meetingId, String);
  check(body, Object);

  const { annotations, whiteboardId, multiUser } = body;

  check(annotations, Array);
  check(whiteboardId, String);
  check(multiUser, Array);

  await clearAnnotations(meetingId, whiteboardId);
  // we use a for loop here instead of a map because we need to guarantee the order of the annotations.
  for (const annotation of annotations) {
    const { wbId, userId } = annotation;
    await addAnnotation(meetingId, wbId, userId, annotation);
  }

  await modifyWhiteboardAccess(meetingId, whiteboardId, multiUser);
  return true;
}

export default handleWhiteboardAnnotations;
