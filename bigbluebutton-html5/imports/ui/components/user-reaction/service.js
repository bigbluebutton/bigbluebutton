import UserReaction from '/imports/api/user-reaction';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { isReactionsEnabled } from '/imports/ui/services/features/index';

const ENABLED = Meteor.settings.public.userReaction.enabled;

const isEnabled = () => isReactionsEnabled() && getFromUserSettings('enable-user-reaction', ENABLED);

const setUserReaction = (reaction) => {
  if (isEnabled()) {
    makeCall('setUserReaction', reaction);
  }
};

const getUsersIdFromUserReaction = () => UserReaction.find(
  { meetingId: Auth.meetingID },
  { fields: { userId: 1 } },
).fetch().map((user) => user.userId);

const getUserReaction = (userId) => {
  const reaction = UserReaction.findOne(
    {
      meetingId: Auth.meetingID,
      userId,
    },
    {
      fields:
        {
          reaction: 1,
        },
    },
  );

  if (!reaction) {
    return {
      reaction: 'none',
    };
  }

  return reaction.reaction;
};

export default {
  getUserReaction,
  setUserReaction,
  getUsersIdFromUserReaction,
  isEnabled,
};
