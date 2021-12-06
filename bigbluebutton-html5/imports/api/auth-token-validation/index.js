import { Meteor } from 'meteor/meteor';

const collectionOptions = Meteor.isClient ? {
  connection: null,
} : {};

const AuthTokenValidation = new Mongo.Collection('auth-token-validation', collectionOptions);

if (Meteor.isServer) {
  AuthTokenValidation._ensureIndex({ meetingId: 1, userId: 1 });
}

export const ValidationStates = Object.freeze({
  NOT_VALIDATED: 1,
  VALIDATING: 2,
  VALIDATED: 3,
  INVALID: 4,
});

export default AuthTokenValidation;
