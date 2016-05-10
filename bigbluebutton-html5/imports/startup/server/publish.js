import { WhiteboardCleanStatus } from '/imports/startup/collections';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('whiteboard-clean-status', function (meetingId) { //TODO Anton - remove
  logger.info(`whiteboard clean status ${meetingId}`);
  return WhiteboardCleanStatus.find({
    meetingId: meetingId,
  });
});
