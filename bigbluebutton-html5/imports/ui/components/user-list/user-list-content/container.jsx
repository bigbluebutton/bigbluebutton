import React from 'react';
import UserContent from './component';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

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
  const { isGuestLobbyMessageEnabled } = WaitingUsersService;
  const isWaitingRoomEnabled = currentMeeting?.usersPolicies?.guestPolicy === ASK_MODERATOR;

  return (
    <UserContent
      {...{
        isGuestLobbyMessageEnabled,
        currentUser,
        isTimerActive: currentMeeting?.componentsFlags?.hasTimer && currentUser?.isModerator,
        isWaitingRoomEnabled,
        ...props,
      }}
    />
  );
};

export default UserContentContainer;
