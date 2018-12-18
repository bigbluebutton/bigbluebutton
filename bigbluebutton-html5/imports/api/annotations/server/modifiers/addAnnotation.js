import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Annotations from '/imports/api/annotations';
import addAnnotationQuery from '/imports/api/annotations/addAnnotation';

export default function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  let query = addAnnotationQuery(meetingId, whiteboardId, userId, annotation);

  const cb = (err, numChanged) => {
    if (err) {
      return Logger.error(`Adding annotation to collection: ${err}`);
    }

    const { insertedId } = numChanged;
    if (insertedId) {
      return Logger.info(`Added annotation id=${annotation.id} whiteboard=${whiteboardId}`);
    }

    return Logger.info(`Upserted annotation id=${annotation.id} whiteboard=${whiteboardId}`);
  };

  return Annotations.upsert(query.selector, query.modifier, cb);
}
