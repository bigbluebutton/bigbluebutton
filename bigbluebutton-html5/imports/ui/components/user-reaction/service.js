import UserReaction from '/imports/api/user-reaction';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { isReactionsEnabled } from '/imports/ui/services/features/index';

const ENABLED = window.meetingClientSettings.public.userReaction.enabled;

const isEnabled = () => isReactionsEnabled() && getFromUserSettings('enable-user-reaction', ENABLED);

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
          creationDate: 1,
        },
    },
  );

  if (!reaction) {
    return {
      reaction: 'none',
      reactionTime: 0,
    };
  }

  return { reaction: reaction.reaction, reactionTime: reaction.creationDate.getTime() };
};

export default {
  getUserReaction,
  getUsersIdFromUserReaction,
  isEnabled,
};
