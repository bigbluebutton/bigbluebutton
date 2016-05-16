import Slides from '/imports/api/slides';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('slides', function (credentials) {
  const { meetingId } = credentials;
  logger.info(`publishing slides for ${meetingId}`);
  return Slides.find({
    meetingId: meetingId,
  });
});
