import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserContent from './component';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

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
  }));
  const { isGuestLobbyMessageEnabled } = WaitingUsersService;

  return (
    <UserContent
      {...{
        isGuestLobbyMessageEnabled,
        currentUser,
        isTimerActive: currentMeeting?.componentsFlags?.hasTimer && currentUser.isModerator,
        ...props,
      }}
    />
  );
};

export default withTracker(() => ({
  isWaitingRoomEnabled: WaitingUsersService.isWaitingRoomEnabled(),
}))(UserContentContainer);
