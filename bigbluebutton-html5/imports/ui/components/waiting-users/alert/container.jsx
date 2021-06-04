import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users/';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import WaitingComponent from './component';
import { NLayoutContext } from '../../layout/context/context';
import { PANELS } from '../../layout/enums';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const WaitingContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { input } = newLayoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;
  const managementPanelIsOpen = sidebarContentPanel === PANELS.WAITING_USERS;

  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];
  const currentUserIsModerator = currentUser.role === ROLE_MODERATOR;
  const joinTime = currentUser.authTokenValidatedTime;
  return (
    <WaitingComponent {...{
      newLayoutContextDispatch,
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
