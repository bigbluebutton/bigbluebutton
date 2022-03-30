import { check } from 'meteor/check';
import Annotations from '/imports/api/annotations';
import Logger from '/imports/startup/server/logger';
import AnnotationsStreamer from '../streamer';

export default function removeAnnotation(meetingId, whiteboardId, shapeId) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(shapeId, String);

  AnnotationsStreamer(meetingId).emit('removed', { meetingId, whiteboardId, shapeId });

  const selector = {
    meetingId,
    whiteboardId,
    id: shapeId,
  };

  try {
    const numberAffected = Annotations.remove(selector);

    if (numberAffected) {
      Logger.info(`Removed annotation id=${shapeId} whiteboard=${whiteboardId}`);
    }
  } catch (err) {
    Logger.error(`Removing annotation from collection: ${err}`);
  }
}
