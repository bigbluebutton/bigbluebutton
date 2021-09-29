import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Auth from '/imports/ui/services/auth';
import Storage from '/imports/ui/services/storage/session';
import UserContent from './component';
import GuestUsers from '/imports/api/guest-users/';
import LayoutContext from '../../layout/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const CLOSED_CHAT_LIST_KEY = 'closedChatList';
const STARTED_CHAT_LIST_KEY = 'startedChatList';

const UserContentContainer = (props) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const { input } = layoutContextState;
  const { sidebarContent } = input;
  const { sidebarContentPanel } = sidebarContent;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = {
    userId: Auth.userID,
    presenter: users[Auth.meetingID][Auth.userID].presenter,
    locked: users[Auth.meetingID][Auth.userID].locked,
    role: users[Auth.meetingID][Auth.userID].role,
  };
  return (
    <UserContent
      {...{
        layoutContextDispatch,
        sidebarContentPanel,
        ...props,
      }}
      currentUser={currentUser}
    />
  );
};

export default withTracker(() => ({
  pollIsOpen: Session.equals('isPollOpen', true),
  forcePollOpen: Session.equals('forcePollOpen', true),
  currentClosedChats: Storage.getItem(CLOSED_CHAT_LIST_KEY) || [],
  startedChats: Session.get(STARTED_CHAT_LIST_KEY) || [],
  pendingUsers: GuestUsers.find({
    meetingId: Auth.meetingID,
    approved: false,
    denied: false,
  }).fetch(),
}))(UserContentContainer);
