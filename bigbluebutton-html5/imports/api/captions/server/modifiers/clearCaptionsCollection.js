import Captions from '/imports/api/captions';
import { logger } from '/imports/startup/server/logger';

// called on server start and meeting end
export function clearCaptionsCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Captions.remove({
      meetingId: meetingId,
    }, logger.info(`cleared Captions Collection (meetingId: ${meetingId}!`));
  } else {
    return Captions.remove({}, logger.info('cleared Captions Collection (all meetings)!'));
  }
};
