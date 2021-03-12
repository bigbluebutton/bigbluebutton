import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';
import UserContent from './component';
import GuestUsers from '/imports/api/guest-users/';
import Users from '/imports/api/users';

const CLOSED_CHAT_LIST_KEY = 'closedChatList';

const UserContentContainer = props => <UserContent {...props} />;

export default withTracker(() => ({
  pollIsOpen: Session.equals('isPollOpen', true),
  forcePollOpen: Session.equals('forcePollOpen', true),
  currentClosedChats: Storage.getItem(CLOSED_CHAT_LIST_KEY) || [],
  currentUser: Users.findOne({ userId: Auth.userID }, {
    fields: {
      userId: 1,
      role: 1,
      guest: 1,
      locked: 1,
      presenter: 1,
    },
  }),
  pendingUsers: GuestUsers.find({
    meetingId: Auth.meetingID,
    approved: false,
    denied: false,
  }).fetch(),
}))(UserContentContainer);
