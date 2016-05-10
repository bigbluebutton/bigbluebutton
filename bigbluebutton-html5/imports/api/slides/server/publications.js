import { Slides } from '../slidesCollection';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('slides', function (meetingId) {
  logger.info(`publishing slides for ${meetingId}`);
  return Slides.find({
    meetingId: meetingId,
  });
});
