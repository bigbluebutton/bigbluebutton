import { check } from 'meteor/check';
import Annotations from '/imports/api/annotations';
import Logger from '/imports/startup/server/logger';

export default async function removeAnnotation(meetingId, whiteboardId, shapeId) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(shapeId, String);

  const selector = {
    meetingId,
    whiteboardId,
    id: shapeId,
  };

  try {
    const numberAffected = await Annotations.removeAsync(selector);

    if (numberAffected) {
      Logger.info(`Removed annotation id=${shapeId} whiteboard=${whiteboardId}`);
    }
  } catch (err) {
    Logger.error(`Removing annotation from collection: ${err}`);
  }
}
