import VoiceCallStates from '/imports/api/voice-call-states';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

function voiceCallStates() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing VoiceCallStates was requested by unauth connection ${this.connection.id}`);
    return VoiceCallStates.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug('Publishing Voice Call States', { meetingId, userId });

  return VoiceCallStates.find({ meetingId, userId });
}

function publish(...args) {
  const boundVoiceCallStates = voiceCallStates.bind(this);
  return boundVoiceCallStates(...args);
}

Meteor.publish('voice-call-states', publish);
