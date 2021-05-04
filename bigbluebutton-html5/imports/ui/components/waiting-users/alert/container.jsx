import React, { useContext } from 'react';
import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users/';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import WaitingComponent from './component';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const WaitingContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const currentUserIsModerator = currentUser.role === ROLE_MODERATOR;
  const joinTime = currentUser.authTokenValidatedTime;
  return (
    <WaitingComponent {...{
      ...props,
      currentUserIsModerator,
      joinTime,
    }}
    />
  );
};


export default withTracker(() => {
  const pendingUsers = GuestUsers.find({
    meetingId: Auth.meetingID,
    approved: false,
    denied: false,
  }).fetch();
  const managementPanelIsOpen = Session.get('openPanel') === 'waitingUsersPanel';

  return {
    managementPanelIsOpen,
    pendingUsers,
  };
})(WaitingContainer);
