import Shapes from '/imports/api/shapes';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import mapToAcl from '/imports/startup/mapToAcl';

Meteor.publish('shapes', function() {
  const boundShapes = shapes.bind(this);
  return mapToAcl('shapes', boundShapes)(arguments);
});

function shapes(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing Shapes for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Shapes.find({ meetingId });
};
