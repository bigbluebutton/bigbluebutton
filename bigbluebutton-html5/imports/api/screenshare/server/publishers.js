import Screenshare from '/imports/api/screenshare';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

function screenshare(credentials) {
  const { meetingId, requesterUserId } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);

  Logger.info(`Publishing Screenshare for ${meetingId} ${requesterUserId}`);

  return Screenshare.find({ meetingId });
}

function publish(...args) {
  const boundScreenshare = screenshare.bind(this);
  return boundScreenshare(...args);
}

Meteor.publish('screenshare', publish);
