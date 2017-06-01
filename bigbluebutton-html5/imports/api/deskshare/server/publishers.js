import Deskshare from '/imports/api/deskshare';
import { logger } from '/imports/startup/server/logger';

import mapToAcl from '/imports/startup/mapToAcl';

Meteor.publish('deskshare', function() {
  deskshare = deskshare.bind(this);
  return mapToAcl('deskshare', deskshare)(arguments);
});

function deskshare(credentials) {
  const { meetingId } = credentials;
  logger.info(`publishing deskshare for ${meetingId}`);
  return Deskshare.find({ meetingId: meetingId });
};
