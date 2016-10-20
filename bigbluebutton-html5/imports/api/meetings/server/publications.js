import Meetings from '/imports/api/meetings';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('meetings', function (credentials) {
  const { meetingId } = credentials;
  logger.info(`publishing meetings for ${meetingId}`);
  return Meetings.find({
    meetingId: meetingId,
  });
});
