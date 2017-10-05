import Deskshare from '/imports/api/1.1/deskshare';
import { logger } from '/imports/startup/server/logger';

export function clearDeskshareCollection(meetingId) {
  if (meetingId != null) {
    Deskshare.remove({ meetingId }, function () {
      logger.info(`cleared Deskshare Collection (meetingId: ${this.meetingId}!)`);
    });
  } else {
    Deskshare.remove({}, () => {
      logger.info('cleared Deskshare Collection (all meetings)!');
    });
  }
}
