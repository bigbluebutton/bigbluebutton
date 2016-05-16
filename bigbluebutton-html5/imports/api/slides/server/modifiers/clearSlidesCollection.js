import Slides from '/imports/api/slides';
import { logger } from '/imports/startup/server/logger';

// called on server start and meeting end
export function clearSlidesCollection() {
    const meetingId = arguments[0];
    if (meetingId != null) {
        return Slides.remove({
            meetingId: meetingId,
        }, logger.info(`cleared Slides Collection (meetingId: ${meetingId}!`));
    } else {
        return Slides.remove({}, logger.info('cleared Slides Collection (all meetings)!'));
    }
};