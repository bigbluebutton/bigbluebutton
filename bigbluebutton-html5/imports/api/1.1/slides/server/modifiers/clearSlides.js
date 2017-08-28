import Slides from './../../';
import Logger from '/imports/startup/server/logger';

export default function clearSlides(meetingId) {
  if (meetingId) {
    return Slides.remove({ meetingId }, Logger.info(`Cleared Slides (${meetingId})`));
  }

  return Slides.remove({}, Logger.info('Cleared Slides (all)'));
}
