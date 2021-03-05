import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users/';
import Users from '/imports/api/users/';
import WaitingComponent from './component';
import { NLayoutContext } from '../../layout/context/context';
import { PANELS } from '../../layout/enums';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

const WaitingContainer = (props) => {
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState, newLayoutContextDispatch } = newLayoutContext;
  const { sidebarContentPanel } = newLayoutContextState;
  const managementPanelIsOpen = sidebarContentPanel === PANELS.WAITING_USERS;
  return <WaitingComponent {...{ managementPanelIsOpen, newLayoutContextDispatch, ...props }} />;
};

export default withTracker(() => {
  const pendingUsers = GuestUsers.find({
    meetingId: Auth.meetingID,
    approved: false,
    denied: false,
  }).fetch();

  const currentUser = Users.findOne({ userId: Auth.userID },
    { fields: { role: 1, loginTime: 1 } });
  return {
    pendingUsers,
    currentUserIsModerator: currentUser.role === ROLE_MODERATOR,
    joinTime: currentUser.loginTime,
  };
})(WaitingContainer);
