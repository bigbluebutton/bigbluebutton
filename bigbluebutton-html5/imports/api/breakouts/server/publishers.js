import { Meteor } from 'meteor/meteor';
import Breakouts from '/imports/api/breakouts';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import AuthTokenValidation, { ValidationStates } from '/imports/api/auth-token-validation';
import { publicationSafeGuard } from '/imports/api/common/server/helpers';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

async function breakouts() {
  const tokenValidation = await AuthTokenValidation
    .findOneAsync({ connectionId: this.connection.id });

  if (!tokenValidation || tokenValidation.validationStatus !== ValidationStates.VALIDATED) {
    Logger.warn(`Publishing Breakouts was requested by unauth connection ${this.connection.id}`);
    return Breakouts.find({ meetingId: '' });
  }
  const { meetingId, userId } = tokenValidation;

  const User = await Users.findOneAsync({ userId, meetingId }, { fields: { role: 1 } });
  Logger.debug('Publishing Breakouts', { meetingId, userId });

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
      captureNotes: 1,
      captureSlides: 1,
    },
  };

  if (!!User && User.role === ROLE_MODERATOR) {
    const presenterSelector = {
      $or: [
        { parentMeetingId: meetingId },
        { breakoutId: meetingId },
      ],
    };
    // Monitor this publication and stop it when user is not a moderator anymore
    const comparisonFunc = async () => {
      const user = await Users.findOneAsync({ userId, meetingId }, { fields: { role: 1, userId: 1 } });
      const condition = user.role === ROLE_MODERATOR;

      if (!condition) {
        Logger.info(`conditions aren't filled anymore in publication ${this._name}: 
        user.role === ROLE_MODERATOR :${condition}, user.role: ${user.role} ROLE_MODERATOR: ${ROLE_MODERATOR}`);
      }

      return condition;
    };
    publicationSafeGuard(comparisonFunc, this);
    return Breakouts.find(presenterSelector, fields);
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

  return Breakouts.find(selector, fields);
}

function publish(...args) {
  const boundBreakouts = breakouts.bind(this);
  return boundBreakouts(...args);
}

Meteor.publish('breakouts', publish);
