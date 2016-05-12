import Cursor from '/imports/api/cursor/collection';
import { logger } from '/imports/startup/server/logger';

export function updateCursorLocation(meetingId, cursorObject) {
    return Cursor.update({
        meetingId: meetingId,
    }, {
        $set: {
            x: cursorObject.x,
            y: cursorObject.y,
        },
    }, (err, numChanged) => {
        if (err != null) {
            return logger.error(`_unsucc update of cursor for ${meetingId} err=${JSON.stringify(err)}`);
        } else {
            // logger.info "updated cursor for #{meetingId} #{JSON.stringify cursorObject}"
        }
    });
};
