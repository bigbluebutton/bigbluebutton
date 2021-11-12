import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import deleteAnnotation from '../methods/modifyAnnotation';

export default function handleWhiteboardModification({ body }, meetingId) {
  Logger.info('\nCalled handleWhiteboardModification:\n');
  Logger.info(`${JSON.stringify(body)}${body}${meetingId}`);
  Logger.info('\n');

  check(body, {
    annotations: [Match.Any], userId: String, whiteBoardId: String, action: String,
  });
  const { whiteBoardId } = body;
  const { annotations } = body;
  const { action } = body;

  annotations.forEach((annotation) => {
    check(annotation.id, String);
    switch (action) {
      case 'delete':
        deleteAnnotation(meetingId, whiteBoardId, annotation.id);
        break;
      default:
        Logger.warn(`Unknown action type: ${action}`);
    }
  });
}
