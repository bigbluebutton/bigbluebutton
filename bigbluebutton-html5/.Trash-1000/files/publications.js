import Cursor from '/imports/api/cursor';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('cursor', function (credentials) {
  const { meetingId } = credentials;
  logger.info(`publishing cursor for ${meetingId}`);
  return Cursor.find({
    meetingId: meetingId,
  });
});
