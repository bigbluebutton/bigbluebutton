import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import UserContent from './component';
import TimerService from '/imports/ui/components/timer/service';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const UserContentContainer = (props) => {
  const { data: currentUser } = useCurrentUser((user) => ({
    userId: user.userId,
    presenter: user.presenter,
    locked: user.locked,
    role: user.role,
  }));
  const { isGuestLobbyMessageEnabled } = WaitingUsersService;

  return (
    <UserContent
      {...{
        isGuestLobbyMessageEnabled,
        currentUser,
        ...props,
      }}
    />
  );
};

export default withTracker(() => ({
  isTimerActive: TimerService.isActive(),
  isWaitingRoomEnabled: WaitingUsersService.isWaitingRoomEnabled(),
}))(UserContentContainer);
