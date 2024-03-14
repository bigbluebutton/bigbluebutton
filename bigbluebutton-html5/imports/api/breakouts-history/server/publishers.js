import BreakoutsHistory from '/imports/api/breakouts-history';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';
import Logger from '/imports/startup/server/logger';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import { publicationSafeGuard } from '/imports/api/common/server/helpers';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

async function breakoutsHistory() {
  const tokenValidation = await AuthTokenValidation
    .findOneAsync({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Meetings-history was requested by unauth connection ${this.connection.id}`);
    return Meetings.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;
  Logger.debug('Publishing Breakouts-History', { meetingId, userId });

  const User = await Users.findOneAsync({ userId, meetingId }, { fields: { userId: 1, role: 1 } });
  if (!User || User.role !== ROLE_MODERATOR) {
    return BreakoutsHistory.find({ meetingId: '' });
  }

  check(meetingId, String);

  const selector = {
    meetingId,
  };

  // Monitor this publication and stop it when user is not a moderator anymore
  const comparisonFunc = async () => {
    const user = await Users
      .findOneAsync({ userId, meetingId }, { fields: { role: 1, userId: 1 } });
    const condition = user.role === ROLE_MODERATOR;

    if (!condition) {
      Logger.info(`conditions aren't filled anymore in publication ${this._name}: 
      user.role === ROLE_MODERATOR :${condition}, user.role: ${user.role} ROLE_MODERATOR: ${ROLE_MODERATOR}`);
    }

    return condition;
  };
  publicationSafeGuard(comparisonFunc, this);

  return BreakoutsHistory.find(selector);
}

function publish(...args) {
  const boundUsers = breakoutsHistory.bind(this);
  return boundUsers(...args);
}

Meteor.publish('breakouts-history', publish);
