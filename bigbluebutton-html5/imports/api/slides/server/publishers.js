import { Slides, SlidePositions } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import Logger from '/imports/startup/server/logger';

function slides(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.debug(`Publishing Slides for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return Slides.find({ meetingId });
}

function publish(...args) {
  const boundSlides = slides.bind(this);
  return boundSlides(...args);
}

Meteor.publish('slides', publish);

function slidePositions(credentials) {
  const { meetingId, requesterUserId, requesterToken } = credentials;

  check(meetingId, String);
  check(requesterUserId, String);
  check(requesterToken, String);

  Logger.debug(`Publishing SlidePositions for ${meetingId} ${requesterUserId} ${requesterToken}`);

  return SlidePositions.find({ meetingId });
}

function publishPositions(...args) {
  const boundSlidePositions = slidePositions.bind(this);
  return boundSlidePositions(...args);
}

Meteor.publish('slide-positions', publishPositions);
