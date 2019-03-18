import Annotations from '/imports/api/annotations';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

function annotations(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.debug(`Publishing Annotations for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Annotations.find({ meetingId });
}

function publish(...args) {
  const boundAnnotations = annotations.bind(this);
  return boundAnnotations(...args);
}

Meteor.publish('annotations', publish);
