import Deskshare from '/imports/api/1.1/deskshare';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('deskshare', (credentials) => {
  const { meetingId } = credentials;
  logger.info(`publishing deskshare for ${meetingId}`);
  return Deskshare.find({ meetingId });
});
