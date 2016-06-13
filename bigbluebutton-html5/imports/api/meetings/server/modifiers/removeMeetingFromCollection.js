import { clearCollections } from '/imports/api/common/server/helpers';
import Meetings from '/imports/api/meetings';
import { logger } from '/imports/startup/server/logger';

//clean up upon a meeting's end
export function removeMeetingFromCollection(meetingId, callback) {
  if (Meetings.findOne({
    meetingId: meetingId,
  }) != null) {
    logger.info(`end of meeting ${meetingId}. Clear the meeting data from all collections`);

    clearCollections(meetingId);

    return callback();
  } else {
    let funct = function (localCallback) {
      logger.error(`Error! There was no such meeting ${meetingId}`);
      return localCallback();
    };

    return funct(callback);
  }
};
