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

  const currentUser = Users.findOne({ userId: Auth.userID },
    { fields: { role: 1, loginTime: 1 } });
  return {
    managementPanelIsOpen,
    pendingUsers,
    currentUserIsModerator: currentUser.role === ROLE_MODERATOR,
    joinTime: currentUser.loginTime,
  };
})(WaitingContainer);
