import { Slides, SlidePositions } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';

export default function clearSlides(meetingId) {
  if (meetingId) {
    SlidePositions.remove({ meetingId }, () => {
      Logger.info(`Cleared SlidePositions (${meetingId})`);
    });

    return Slides.remove({ meetingId }, () => {
      Logger.info(`Cleared Slides (${meetingId})`);
    });
  }

  SlidePositions.remove({}, () => {
    Logger.info('Cleared SlidePositions (all)');
  });

  return Slides.remove({}, () => {
    Logger.info('Cleared Slides (all)');
  });
}
