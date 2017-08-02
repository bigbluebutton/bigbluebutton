import Annotations from '/imports/api/2.0/annotations';
import Logger from '/imports/startup/server/logger';

export default function clearAnnotations(meetingId, whiteboardId) {
  if (meetingId && whiteboardId) {
    return Annotations.remove({ meetingId, whiteboardId }, Logger.info(`Cleared Annotations from whiteboard ${whiteboardId} (${meetingId})`));
  } else if (meetingId) {
    return Annotations.remove({ meetingId }, Logger.info(`Cleared Annotations (${meetingId})`));
  }

  return Annotations.remove({}, Logger.info('Cleared Annotations (all)'));
}
