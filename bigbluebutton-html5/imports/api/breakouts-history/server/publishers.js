import BreakoutsHistory from '/imports/api/breakouts-history';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import AuthTokenValidation, { ValidationStates } from '../../auth-token-validation';
import Logger from '../../../startup/server/logger';
import Meetings from '../../meetings';
import Users from '../../users';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function breakoutsHistory() {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Meetings-history was requested by unauth connection ${this.connection.id}`);
    return Meetings.find({ meetingId: '' });
  }

  const { meetingId, userId } = tokenValidation;
  Logger.debug('Publishing Breakouts-History', { meetingId, userId });

  const User = Users.findOne({ userId, meetingId }, { fields: { userId: 1, role: 1 } });
  if (!User || User.role !== ROLE_MODERATOR) {
    return BreakoutsHistory.find({ meetingId: '' });
  }

  check(meetingId, String);

  const selector = {
    meetingId,
  };

  return BreakoutsHistory.find(selector);
}

function publish(...args) {
  const boundUsers = breakoutsHistory.bind(this);
  return boundUsers(...args);
}

Meteor.publish('breakouts-history', publish);
