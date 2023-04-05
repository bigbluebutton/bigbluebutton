import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Annotations from '/imports/api/annotations';
import addAnnotationQuery from '/imports/api/annotations/addAnnotation';

export default async function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  const query = await addAnnotationQuery(meetingId, whiteboardId, userId, annotation, Annotations);

  try {
    const { insertedId } = await Annotations.upsertAsync(query.selector, query.modifier);

    if (insertedId) {
      Logger.info(`Added annotation id=${annotation.id} whiteboard=${whiteboardId}`);
    }
  } catch (err) {
    Logger.error(`Adding annotation to collection: ${err}`);
  }
}
