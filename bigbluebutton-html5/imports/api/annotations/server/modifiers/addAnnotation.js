import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Annotations from '/imports/api/annotations';
import addAnnotationQuery from '/imports/api/annotations/addAnnotation';

export default function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  const query = addAnnotationQuery(meetingId, whiteboardId, userId, annotation);

  try {
    const { insertedId } = Annotations.upsert(query.selector, query.modifier);

    if (insertedId) {
      Logger.info(`Added annotation id=${annotation.id} whiteboard=${whiteboardId}`);
    }
  } catch (err) {
    Logger.error(`Adding annotation to collection: ${err}`);
  }
}
