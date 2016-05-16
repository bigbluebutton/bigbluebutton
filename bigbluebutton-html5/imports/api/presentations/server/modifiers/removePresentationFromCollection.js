import Slides from '/imports/api/slides';
import Presentations from '/imports/api/presentations';
import { logger } from '/imports/startup/server/logger';

export function removePresentationFromCollection(meetingId, presentationId) {
    let id, presentationObject;
    presentationObject = Presentations.findOne({
        meetingId: meetingId,
        'presentation.id': presentationId,
    });
    if (presentationObject != null) {
        Slides.remove({
            presentationId: presentationId,
        }, logger.info(`cleared Slides Collection (presentationId: ${presentationId}!`));
        Presentations.remove(presentationObject._id);
        return logger.info(`----removed presentation[${presentationId}] from ${meetingId}`);
    }
};
