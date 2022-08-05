import Users from '/imports/api/users';
import { Meteor } from 'meteor/meteor';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';
import { extractCredentials, publicationSafeGuard } from '/imports/api/common/server/helpers';
import { check } from 'meteor/check';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function currentUser() {
  if (!this.userId) {
    Mongo.Collection._publishCursor(Users.find({ meetingId: '' }), this, 'current-user');
    return this.ready();
  }
  const { meetingId, requesterUserId } = extractCredentials(this.userId);

  check(meetingId, String);
  check(requesterUserId, String);

  const selector = {
    meetingId,
    userId: requesterUserId,
    intId: { $exists: true },
  };

  const options = {
    fields: {
      user: false,
      authToken: false, // Not asking for authToken from client side but also not exposing it
    },
  };
  Mongo.Collection._publishCursor(Users.find(selector, options), this, 'current-user');
  return this.ready();
}

function publishCurrentUser(...args) {
  const boundUsers = currentUser.bind(this);
  return boundUsers(...args);
}

Meteor.publish('current-user', publishCurrentUser);

function users() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Users was requested by unauth connection ${this.connection.id}`);
    return Users.find({ meetingId: '' });
  }

  if (!this.userId) {
    return Users.find({ meetingId: '' });
  }
  const { meetingId, userId } = tokenValidation;

  Logger.debug(`Publishing Users for ${meetingId} ${userId}`);

  const selector = {
    $or: [
      { meetingId },
    ],
    intId: { $exists: true },
    left: false,
  };

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1 } });
  if (!!User && User.role === ROLE_MODERATOR) {
    selector.$or.push({
      'breakoutProps.isBreakoutUser': true,
      'breakoutProps.parentId': meetingId,
    });
    // Monitor this publication and stop it when user is not a moderator anymore
    const comparisonFunc = () => {
      const user = Users.findOne({ userId, meetingId }, { fields: { role: 1, userId: 1 } });
      const condition = user.role === ROLE_MODERATOR;
      if (!condition) {
        Logger.info(`conditions aren't filled anymore in publication ${this._name}: 
        user.role === ROLE_MODERATOR :${condition}, user.role: ${user.role} ROLE_MODERATOR: ${ROLE_MODERATOR}`);
      }

      return condition;
    };
    publicationSafeGuard(comparisonFunc, this);
  }

  const options = {
    fields: {
      authToken: false,
    },
  };

  Logger.debug('Publishing Users', { meetingId, userId });

  return Users.find(selector, options);
}

function publish(...args) {
  const boundUsers = users.bind(this);
  return boundUsers(...args);
}

Meteor.publish('users', publish);
