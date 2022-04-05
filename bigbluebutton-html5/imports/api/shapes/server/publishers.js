import Shapes from '/imports/api/shapes';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';
import { extractCredentials, publicationSafeGuard } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';
// import { DDPServer } from 'meteor/ddp-server';

// Meteor.server.setPublicationStrategy('shapes', DDPServer.publicationStrategies.NO_MERGE);

function shapes() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Shape was requested by unauth connection ${this.connection.id}`);
    return Shapes.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.info('Publishing Shapes', { meetingId, userId });
  
  const selector = {
    meetingId,
  };

  return Shapes.find(selector);
}

function publish(...args) {
  const boundShapes = shapes.bind(this);
  return boundShapes(...args);
}

Meteor.publish('shapes', publish);
