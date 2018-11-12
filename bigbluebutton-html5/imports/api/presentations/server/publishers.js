import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Presentations from '/imports/api/presentations';
import Logger from '/imports/startup/server/logger';

function presentations(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing Presentations for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Presentations.find({ meetingId });
}

function publish(...args) {
  const boundPresentations = presentations.bind(this);
  return boundPresentations(...args);
}

Meteor.publish('presentations', publish);
