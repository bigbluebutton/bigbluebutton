import Presentations from '/imports/api/presentations';
import { logger } from '/imports/startup/server/logger';

// called on server start and meeting end
export function clearPresentationsCollection() {
  const meetingId = arguments[0];
  if (meetingId != null) {
    return Presentations.remove({
      meetingId: meetingId,
    }, logger.info(`cleared Presentations Collection (meetingId: ${meetingId}!`));
  } else {
    return Presentations.remove({}, logger.info('cleared Presentations Collection(all meetings)!'));
  }
};
