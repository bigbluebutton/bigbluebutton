import Shapes from './../';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function shapes(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing Shapes for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Shapes.find({ meetingId });
}

function publish(...args) {
  const boundShapes = shapes.bind(this);
  return mapToAcl('subscriptions.shapes', boundShapes)(args);
}

Meteor.publish('shapes', publish);
