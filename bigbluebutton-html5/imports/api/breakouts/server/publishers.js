import { Meteor } from 'meteor/meteor';
import Breakouts from '/imports/api/breakouts';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function breakouts(role) {
  const tokenValidation = AuthTokenValidation.findOne({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Breakouts was requested by unauth connection ${this.connection.id}`);
    return Breakouts.find({ meetingId: '' });
  }
  const { meetingId, userId } = tokenValidation;

  const User = Users.findOne({ userId, meetingId }, { fields: { role: 1 } });
  Logger.debug('Publishing Breakouts', { meetingId, userId });

  if (!!User && User.role === ROLE_MODERATOR) {
    const presenterSelector = {
      $or: [
        { parentMeetingId: meetingId },
        { breakoutId: meetingId },
      ],
    };

    return Breakouts.find(presenterSelector);
  }

  const selector = {
    $or: [
      {
        parentMeetingId: meetingId,
        freeJoin: true,
      },
      {
        parentMeetingId: meetingId,
        [`url_${userId}`]: { $exists: true },
      },
      {
        breakoutId: meetingId,
      },
    ],
  };

  const fields = {
    fields: {
      [`url_${userId}`]: 1,
      breakoutId: 1,
      externalId: 1,
      freeJoin: 1,
      isDefaultName: 1,
      joinedUsers: 1,
      name: 1,
      parentMeetingId: 1,
      sequence: 1,
      shortName: 1,
      timeRemaining: 1,
    },
  };

  return Breakouts.find(selector, fields);
}

function publish(...args) {
  const boundBreakouts = breakouts.bind(this);
  return boundBreakouts(...args);
}

Meteor.publish('breakouts', publish);
