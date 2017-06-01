import Cursor from '/imports/api/cursor';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import mapToAcl from '/imports/startup/mapToAcl';

Meteor.publish('cursor', function() {
  const boundCursor = cursor.bind(this);
  return mapToAcl('cursor', boundCursor)(arguments);
});

function cursor(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.debug(`Publishing Cursor for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Cursor.find({ meetingId });
};
