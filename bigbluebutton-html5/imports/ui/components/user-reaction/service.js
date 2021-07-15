import UserReaction from '/imports/api/user-reaction';
import Auth from '/imports/ui/services/auth';
import { makeCall } from '/imports/ui/services/api';
import { getFromMeetingSettingsAsBoolean } from '/imports/ui/services/meeting-settings';

const ENABLED = Meteor.settings.public.userReaction.enabled;

const isEnabled = () => getFromMeetingSettingsAsBoolean('enable-user-reaction', ENABLED);

const setUserReaction = (reaction) => {
  if (isEnabled()) {
    makeCall('setUserReaction', reaction);
  }
};

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

  return reaction;
};

export default {
  getUserReaction,
  setUserReaction,
  isEnabled,
};
