import Meetings from '/imports/api/meetings';
import { logger } from '/imports/startup/server/logger';

export function clearMeetingsCollection() {
    const meetingId = arguments[0];
    if (meetingId != null) {
        return Meetings.remove({
            meetingId: meetingId,
        }, logger.info(`cleared Meetings Collection (meetingId: ${meetingId}!`));
    } else {
        return Meetings.remove({}, logger.info('cleared Meetings Collection (all meetings)!'));
    }
};
