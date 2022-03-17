import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import UserContent from './component';
import GuestUsers from '/imports/api/guest-users';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import WaitingUsersService from '/imports/ui/components/waiting-users/service';

const UserContentContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = {
    userId: Auth.userID,
    presenter: users[Auth.meetingID][Auth.userID].presenter,
    locked: users[Auth.meetingID][Auth.userID].locked,
    role: users[Auth.meetingID][Auth.userID].role,
  };
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
  pendingUsers: GuestUsers.find({
    meetingId: Auth.meetingID,
    approved: false,
    denied: false,
  }).fetch(),
  isWaitingRoomEnabled: WaitingUsersService.isWaitingRoomEnabled(),
}))(UserContentContainer);
