import React from 'react';
import UserContent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { useIsChatEnabled } from '/imports/ui/services/features';

const ASK_MODERATOR = 'ASK_MODERATOR';

const UserContentContainer = (props) => {
  const { data: currentUser } = useCurrentUser((user) => ({
    userId: user.userId,
    presenter: user.presenter,
    locked: user.locked,
    role: user.role,
    isModerator: user.isModerator,
  }));

  const {
    data: currentMeeting,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
    usersPolicies: {
      guestPolicy: m.usersPolicies.guestPolicy,
    },
  }));
  const isChatEnabled = useIsChatEnabled();

  const APP_SETTINGS = window.meetingClientSettings.public.app;
  const isWaitingRoomEnabled = currentMeeting?.usersPolicies?.guestPolicy === ASK_MODERATOR;

  return (
    <UserContent
      {...{
        isGuestLobbyMessageEnabled: APP_SETTINGS.enableGuestLobbyMessage,
        currentUser,
        isTimerActive: currentMeeting?.componentsFlags?.hasTimer && currentUser?.isModerator,
        isWaitingRoomEnabled,
        isChatEnabled,
        ...props,
      }}
    />
  );
};

export default UserContentContainer;
