import Annotations from '/imports/api/2.0/annotations';
import Logger from '/imports/startup/server/logger';

export default function clearAnnotations(meetingId) {
  if (meetingId) {
    return Annotations.remove({ meetingId }, Logger.info(`Cleared Annotations (${meetingId})`));
  }

  return Annotations.remove({}, Logger.info('Cleared Annotations (all)'));
}
