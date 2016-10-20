import Cursor from '/imports/api/cursor';
import { logger } from '/imports/startup/server/logger';

// called on server start and meeting end
export function clearCursorCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Cursor.remove({
      meetingId: meetingId,
    }, () => logger.info(`cleared Cursor Collection (meetingId: ${meetingId})!`));
  } else {
    return Cursor.remove({}, () => logger.info('cleared Cursor Collection (all meetings)!'));
  }
};
