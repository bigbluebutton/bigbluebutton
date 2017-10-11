import Captions from '/imports/api/2.0/captions';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function captions(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.verbose(`Publishing Captions2x for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Captions.find({ meetingId });
}

function publish(...args) {
  const boundCaptions = captions.bind(this);
  return mapToAcl('subscriptions.captions', boundCaptions)(args);
}

Meteor.publish('captions2x', publish);
