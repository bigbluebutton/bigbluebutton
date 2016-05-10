import { Deskshare } from '/imports/api/deskshare/deskshare';
import { logger } from '/imports/startup/server/logger';

Meteor.publish('deskshare', function (meetingId) {
  Meteor.log.info(`publishing deskshare for ${meetingId}`);
  return Deskshare.find({ meetingId: meetingId });
});
