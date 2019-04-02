import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import UserContent from './component';
import GuestUsers from '/imports/api/guest-users/';

const UserContentContainer = props => <UserContent {...props} />;

export default withTracker(() => ({
  pollIsOpen: Session.equals('isPollOpen', true),
  forcePollOpen: Session.equals('forcePollOpen', true),
  pendingUsers: GuestUsers.find({
    meetingId: Auth.meetingID,
    approved: false,
    denied: false,
  }).fetch(),
}))(UserContentContainer);
