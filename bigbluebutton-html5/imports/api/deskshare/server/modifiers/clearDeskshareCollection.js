import Deskshare from '/imports/api/deskshare';
import { logger } from '/imports/startup/server/logger';

export function clearDeskshareCollection(meetingId) {
  if (meetingId != null) {
    Deskshare.remove({ meetingId: meetingId }, function () {
      logger.info(`cleared Deskshare Collection (meetingId: ${this.meetingId}!)`);
    });
  } else {
    Deskshare.remove({}, function () {
      logger.info(`cleared Deskshare Collection (all meetings)!`);
    });
  }
}
