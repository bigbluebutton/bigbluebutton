import { check } from 'meteor/check';
import Annotations from '/imports/api/annotations';
import Logger from '/imports/startup/server/logger';

export default function reorderAnnotation(meetingId, whiteboardId, order) {
  check(meetingId, String);
  check(whiteboardId, String);
  check(order, Array);

  for (const ac of order) {
    const selector = {
      meetingId,
      whiteboardId,
      id: ac.id,
    };

    const modifier = {
      $set: {
        position: ac.position,
      },
    };

    try {
      const numberAffected = Annotations.update(selector, modifier);

      if (numberAffected) {
        Logger.info(`Reposition annotation id=${ac.id} position=${ac.position} whiteboard=${whiteboardId}`);
      }
    } catch (err) {
      Logger.error(`Repositioning annotation in collection: ${err}`);
    }
  }
}
