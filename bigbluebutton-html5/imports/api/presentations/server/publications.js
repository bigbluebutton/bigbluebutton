import Presentations from '/imports/api/presentations';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('presentations', function (credentials) {
  const { meetingId } = credentials;
  logger.info(`publishing presentations for ${meetingId}`);
  return Presentations.find({
    meetingId: meetingId,
  });
});
