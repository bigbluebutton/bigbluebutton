import Slides from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';

export default function clearSlidesCollection(meetingId) {
  if (meetingId) {
    return Slides.remove({ meetingId: meetingId }, Logger.info(`Cleared Slides (${meetingId})`));
  } else {
    return Slides.remove({}, Logger.info('Cleared Slides (all)'));
  }
};
