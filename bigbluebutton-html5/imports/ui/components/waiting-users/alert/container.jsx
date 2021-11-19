import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import WaitingComponent from './component';
import { layoutSelectInput, layoutDispatch } from '../../layout/context';
import { PANELS } from '../../layout/enums';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const WaitingContainer = (props) => {
  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const { sidebarContentPanel } = sidebarContent;
  const managementPanelIsOpen = sidebarContentPanel === PANELS.WAITING_USERS;
  const layoutContextDispatch = layoutDispatch();

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const currentUserIsModerator = currentUser.role === ROLE_MODERATOR;
  const joinTime = currentUser.authTokenValidatedTime;
  return (
    <WaitingComponent {...{
      layoutContextDispatch,
      managementPanelIsOpen,
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

  return {
    pendingUsers,
  };
})(WaitingContainer);
