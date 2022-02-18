import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import UserContent from './component';
import GuestUsers from '/imports/api/guest-users';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';
import Users from '/imports/api/users';
import { UsersReadyContext } from '/imports/ui/components/components-data/users-ready-context/context';

const UserContentContainer = (props) => {
  const { isGuestLobbyMessageEnabled } = WaitingUsersService;
  const usingUsersReadyContext = useContext(UsersReadyContext);
  const { isReady } = usingUsersReadyContext;

  return (
    <UserContent
      {...{
        isGuestLobbyMessageEnabled,
        isReady,
        ...props,
      }}
    />
  );
};

export default withTracker(() => ({
  pendingUsers: GuestUsers.find({
    meetingId: Auth.meetingID,
    approved: false,
    denied: false,
  }).fetch(),
  currentUser: Users.findOne({meetingId: Auth.meetingID, userId: Auth.userID},
    { fields: { presenter: 1, locked: 1, role: 1, userId: 1 } }),
  isWaitingRoomEnabled: WaitingUsersService.isWaitingRoomEnabled(),
}))(UserContentContainer);
