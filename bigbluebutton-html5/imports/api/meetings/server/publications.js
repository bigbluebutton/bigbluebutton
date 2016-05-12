import Meetings from '/imports/api/meetings/collection';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('meetings', function (meetingId) {
  logger.info(`publishing meetings for ${meetingId}`);
  return Meetings.find({
    meetingId: meetingId,
  });
});
