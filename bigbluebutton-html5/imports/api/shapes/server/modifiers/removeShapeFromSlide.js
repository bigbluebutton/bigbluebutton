import Shapes from '/imports/api/shapes';
import { logger } from '/imports/startup/server/logger';

export function removeShapeFromSlide(meetingId, whiteboardId, shapeId) {
  let shapeToRemove;
  if (meetingId != null && whiteboardId != null && shapeId != null) {
    shapeToRemove = Shapes.findOne({
      meetingId: meetingId,
      whiteboardId: whiteboardId,
      'shape.id': shapeId,
    });
    if (shapeToRemove != null) {
      Shapes.remove(shapeToRemove._id);
      logger.info(`----removed shape[${shapeId}] from ${whiteboardId}`);
      return logger.info(`remaining shapes on the slide: ${
        Shapes.find({
          meetingId: meetingId,
          whiteboardId: whiteboardId,
        }).count()}`);
    }
  }
};
