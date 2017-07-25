import Cursor from '/imports/api/2.0/cursor';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

import mapToAcl from '/imports/startup/mapToAcl';

function cursor(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.debug(`Publishing Cursor2x for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Cursor.find({ meetingId });
}

function publish(...args) {
  const boundCursor = cursor.bind(this);
  return mapToAcl('subscriptions.cursor', boundCursor)(args);
}

Meteor.publish('cursor2x', publish);

