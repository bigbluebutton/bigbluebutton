import Captions from '/imports/api/1.1/captions';
import Logger from '/imports/startup/server/logger';

export default function clearCaptions(meetingId) {
  if (meetingId) {
    return Captions.remove({ meetingId }, Logger.info(`Cleared Captions (${meetingId})`));
  }

  return Captions.remove({}, Logger.info('Cleared Captions (all)'));
}
