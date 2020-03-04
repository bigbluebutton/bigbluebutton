import { Meteor } from 'meteor/meteor';
import Breakouts from '/imports/api/breakouts';
import Users from '/imports/api/users';
import Logger from '/imports/startup/server/logger';
import { extractCredentials } from '/imports/api/common/server/helpers';

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

function breakouts(moderator = false) {
  if (!this.userId) {
    return Breakouts.find({ meetingId: '' });
  }

  const { meetingId, requesterUserId } = extractCredentials(this.userId);
  Logger.debug(`Publishing Breakouts for ${meetingId} ${requesterUserId}`);

  if (moderator) {
    const User = Users.findOne({ userId: requesterUserId, meetingId });
    if (!!User && User.role === ROLE_MODERATOR) {
      const presenterSelector = {
        $or: [
          { parentMeetingId: meetingId },
          { breakoutId: meetingId },
        ],
      };

      return Breakouts.find(presenterSelector);
    }
  }

  const selector = {
    $or: [
      {
        parentMeetingId: meetingId,
        freeJoin: true,
      },
      {
        parentMeetingId: meetingId,
        'users.userId': requesterUserId,
      },
      {
        breakoutId: meetingId,
      },
    ],
  };

  return Breakouts.find(selector);
}

function publish(...args) {
  const boundBreakouts = breakouts.bind(this);
  return boundBreakouts(...args);
}

Meteor.publish('breakouts', publish);
