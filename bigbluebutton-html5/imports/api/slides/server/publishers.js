import { Slides, SlidePositions } from '/imports/api/slides';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

async function slides() {
  const tokenValidation = await AuthTokenValidation
    .findOneAsync({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Slides was requested by unauth connection ${this.connection.id}`);
    return Slides.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing Slides', { meetingId, userId });

  return Slides.find({ meetingId });
}

function publish(...args) {
  const boundSlides = slides.bind(this);
  return boundSlides(...args);
}

Meteor.publish('slides', publish);

async function slidePositions() {
  const tokenValidation = await AuthTokenValidation
    .findOneAsync({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing SlidePositions was requested by unauth connection ${this.connection.id}`);
    return SlidePositions.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing SlidePositions', { meetingId, userId });

  return SlidePositions.find({ meetingId });
}

function publishPositions(...args) {
  const boundSlidePositions = slidePositions.bind(this);
  return boundSlidePositions(...args);
}

Meteor.publish('slide-positions', publishPositions);
