import Captions from '/imports/api/2.0/captions';
import Logger from '/imports/startup/server/logger';

export default function clearCaptions(meetingId) {
  if (meetingId) {
    return Captions.remove({ meetingId }, Logger.info(`Cleared Captions2x (${meetingId})`));
  }

  return Captions.remove({}, Logger.info('Cleared Captions2x (all)'));
}
