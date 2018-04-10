import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import PresentationPods from '/imports/api/presentation-pods';
import Logger from '/imports/startup/server/logger';
import mapToAcl from '/imports/startup/mapToAcl';

function presentationPods(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.info(`Publishing presentation-pods for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return PresentationPods.find({ meetingId });
}

function publish(...args) {
  const boundPresentationPods = presentationPods.bind(this);
  return mapToAcl('subscriptions.presentation-pods', boundPresentationPods)(args);
}

Meteor.publish('presentation-pods', publish);
