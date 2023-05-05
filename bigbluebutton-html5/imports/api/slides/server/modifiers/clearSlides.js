import { Slides, SlidePositions } from '/imports/api/slides';
import Logger from '/imports/startup/server/logger';

export default function clearSlides(meetingId) {
  if (meetingId) {
    try {
      const numberAffectedSlidePositions = SlidePositions.remove({ meetingId });

      const numberAffected = Slides.remove({ meetingId });

      if (numberAffectedSlidePositions) {
        Logger.info(`Cleared SlidePositions (${meetingId})`);
      }

      if (numberAffected) {
        Logger.info(`Cleared Slides (${meetingId})`);
      }
    } catch (err) {
      Logger.error(`Error on cleaning Slides (${meetingId}). ${err}`);
    }
  } else {
    try {
      const numberAffectedSlidePositions = SlidePositions.remove({ meetingId });

      const numberAffected = Slides.remove({ meetingId });

      if (numberAffectedSlidePositions) {
        Logger.info(`Cleared SlidePositions (${meetingId})`);
      }

      if (numberAffected) {
        Logger.info('Cleared Slides (all)');
      }
    } catch (err) {
      Logger.error(`Error on cleaning Slides (all). ${err}`);
    }
  }
}
