import Captions from '/imports/api/captions';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

function captions(credentials) {
  const { meetingId } = credentials;

  check(meetingId, String);

  Logger.debug(`Publishing Captions for ${meetingId}`);

  return Captions.find({ meetingId });
}

function publish(...args) {
  const boundCaptions = captions.bind(this);
  return boundCaptions(...args);
}

Meteor.publish('captions', publish);
