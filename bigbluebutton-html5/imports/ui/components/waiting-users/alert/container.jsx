import React, { PureComponent } from 'react';
import { Session } from 'meteor/session';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import GuestUsers from '/imports/api/guest-users/';
import Users from '/imports/api/users/';
import WaitingComponent from './component';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;

class WaitingContainer extends PureComponent {
  render() {
    return (
      <WaitingComponent {...this.props} />
    );
  }
}

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
    currentUserIsModerator: Users.findOne({ userId: Auth.userID }).role === ROLE_MODERATOR,
    joinTime: Users.findOne({ userId: Auth.userID }).loginTime,
  };
})(WaitingContainer);
