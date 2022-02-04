import GuestUsers from '/imports/api/guest-users/';
import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function guestUsers(role) {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing GuestUser was requested by unauth connection ${this.connection.id}`);
    return GuestUsers.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1 } });
  if (!User || User.role !== ROLE_MODERATOR) {
    Logger.warn(
      'Publishing GuestUser was requested by non-moderator connection',
      { meetingId, userId, connectionId: this.connection.id },
    );
    return GuestUsers.find({ meetingId: '' });
  }

  Logger.debug(`Publishing GuestUsers for ${meetingId} ${userId}`);

  return GuestUsers.find({ meetingId });
}

function publish(...args) {
  const boundSlides = guestUsers.bind(this);
  return boundSlides(...args);
}

Meteor.publish('guestUser', publish);
