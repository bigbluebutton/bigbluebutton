import { Slides, SlidePositions } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

function slides() {
  if (!this.userId) {
    return Slides.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  Logger.debug('Publishing Slides', { meetingId, requesterUserId });

  return Slides.find({ meetingId });
}

function publish(...args) {
  const boundSlides = slides.bind(this);
  return boundSlides(...args);
}

Meteor.publish('slides', publish);

function slidePositions() {
  if (!this.userId) {
    return SlidePositions.find({ meetingId: '' });
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  Logger.debug('Publishing SlidePositions', { meetingId, requesterUserId });

  return SlidePositions.find({ meetingId });
}

function publishPositions(...args) {
  const boundSlidePositions = slidePositions.bind(this);
  return boundSlidePositions(...args);
}

Meteor.publish('slide-positions', publishPositions);
