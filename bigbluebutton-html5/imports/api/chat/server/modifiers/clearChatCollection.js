import Chat from '/imports/api/chat/collection';
import { logger } from '/imports/startup/server/logger';

// called on server start and meeting end
export function clearChatCollection() {
    const meetingId = arguments[0];
    if (meetingId != null) {
        return Chat.remove({
            meetingId: meetingId,
        }, logger.info(`cleared Chat Collection (meetingId: ${meetingId}!`));
    } else {
        return Chat.remove({}, logger.info('cleared Chat Collection (all meetings)!'));
    }
};
