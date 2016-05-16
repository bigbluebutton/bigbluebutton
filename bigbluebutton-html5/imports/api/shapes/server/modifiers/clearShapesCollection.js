import Shapes from '/imports/api/shapes';
import { logger } from '/imports/startup/server/logger';

// called on server start and meeting end
export function clearShapesCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Shapes.remove({
      meetingId: meetingId,
    }, () => {
      logger.info(`cleared Shapes Collection (meetingId: ${meetingId}!`);
    });
  } else {
    return Shapes.remove({}, () => {
      logger.info('cleared Shapes Collection (all meetings)!');
    });
  }
};
