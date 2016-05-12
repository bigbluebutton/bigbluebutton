import Shapes from '/imports/api/shapes/collection';
import { logger } from '/imports/startup/server/logger';

export function removeAllShapesFromSlide(meetingId, whiteboardId) {
  logger.info(`removeAllShapesFromSlide__${whiteboardId}`);

  if ((meetingId != null) && (whiteboardId != null) && (Shapes.find({
          meetingId: meetingId,
          whiteboardId: whiteboardId,
        }) != null)) {
    return Shapes.remove({
      meetingId: meetingId,
      whiteboardId: whiteboardId,
    }, () => {
      logger.info('clearing all shapes from slide');
    });
  }
};
