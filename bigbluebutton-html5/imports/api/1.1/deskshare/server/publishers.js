import Deskshare from '/imports/api/1.1/deskshare';
import { logger } from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function deskshare(credentials) {
  const { meetingId } = credentials;
  logger.info(`publishing deskshare for ${meetingId}`);
  return Deskshare.find({ meetingId });
}


function publish(...args) {
  const boundDeskshare = deskshare.bind(this);
  return mapToAcl('subscriptions.deskshare', boundDeskshare)(args);
}

Meteor.publish('deskshare', publish);
