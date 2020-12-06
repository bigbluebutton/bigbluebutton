import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import Annotations from '/imports/api/annotations';
import addAnnotationQuery from '/imports/api/annotations/addAnnotation';
import WhiteboardMultiUser from '/imports/api/whiteboard-multi-user/';

export default function addAnnotation(meetingId, whiteboardId, userId, annotation) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(annotation, Object);

  const data = WhiteboardMultiUser.findOne({ meetingId, whiteboardId });
  const currentMultiUser = data ? data.multiUser : 0;
  
  const query = addAnnotationQuery(meetingId, whiteboardId, userId, annotation, currentMultiUser);

  try {
    const { insertedId } = Annotations.upsert(query.selector, query.modifier);

    if (insertedId) {
      Logger.info(`Added annotation id=${annotation.id} whiteboard=${whiteboardId}`);
    }
  } catch (err) {
    Logger.error(`Adding annotation to collection: ${err}`);
  }
}
