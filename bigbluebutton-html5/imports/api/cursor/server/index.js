import Cursor from '/imports/api/cursor/collection';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('cursor', function (meetingId) {
  logger.info(`publishing cursor for ${meetingId}`);
  return Cursor.find({
    meetingId: meetingId,
  });
});
