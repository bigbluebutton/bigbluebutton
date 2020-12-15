import { Meteor } from 'meteor/meteor';
import NetworkInformation from '/imports/api/network-information';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';


function networkInformation() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing NetworkInformation was requested by unauth connection ${this.connection.id}`);
    return NetworkInformation.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  Logger.debug(`Publishing NetworkInformation for ${meetingId} ${userId}`);
  return NetworkInformation.find({
    meetingId,
  });
}

function publish(...args) {
  const boundNetworkInformation = networkInformation.bind(this);

  return boundNetworkInformation(...args);
}

Meteor.publish('network-information', publish);
