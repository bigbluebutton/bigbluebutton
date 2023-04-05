import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import Pads, { PadsSessions, PadsUpdates } from '/imports/api/pads';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

async function pads() {
  const tokenValidation = await AuthTokenValidation
    .findOneAsync({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Pads was requested by unauth connection ${this.connection.id}`);
    return Pads.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.info(`Publishing Pads for ${meetingId} ${userId}`);

  const options = {
    fields: {
      padId: 0,
    },
  };

  return Pads.find({ meetingId }, options);
}

async function padsSessions() {
  const tokenValidation = await AuthTokenValidation
    .findOneAsync({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing PadsSessions was requested by unauth connection ${this.connection.id}`);
    return PadsSessions.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.info(`Publishing PadsSessions for ${meetingId} ${userId}`);

  return PadsSessions.find({ meetingId, userId });
}

async function padsUpdates() {
  const tokenValidation = await AuthTokenValidation
    .findOneAsync({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing PadsUpdates was requested by unauth connection ${this.connection.id}`);
    return PadsUpdates.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.info(`Publishing PadsUpdates for ${meetingId} ${userId}`);

  return PadsUpdates.find({ meetingId });
}

function publishPads(...args) {
  const boundPads = pads.bind(this);
  return boundPads(...args);
}

function publishPadsSessions(...args) {
  const boundPadsSessions = padsSessions.bind(this);
  return boundPadsSessions(...args);
}

function publishPadsUpdates(...args) {
  const boundPadsUpdates = padsUpdates.bind(this);
  return boundPadsUpdates(...args);
}

Meteor.publish('pads', publishPads);

Meteor.publish('pads-sessions', publishPadsSessions);

Meteor.publish('pads-updates', publishPadsUpdates);
