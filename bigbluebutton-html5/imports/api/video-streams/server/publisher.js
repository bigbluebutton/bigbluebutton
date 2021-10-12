import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import VideoStreams from '/imports/api/video-streams';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function videoStreams() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing VideoStreams was requested by unauth connection ${this.connection.id}`);
    return VideoStreams.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing VideoStreams', { meetingId, userId });

  const selector = {
    meetingId,
  };

  return VideoStreams.find(selector);
}

function publish(...args) {
  const boundVideoStreams = videoStreams.bind(this);
  return boundVideoStreams(...args);
}

Meteor.publish('video-streams', publish);
