import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import ChatService from '/imports/ui/components/chat/service';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const UserParticipantsContainer = (props) => {
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const currentUser = users[Auth.meetingID][Auth.userID];

  return <UserParticipants {...{ currentUser, ...props }} />;
};

export default withTracker(() => {
  ChatService.removePackagedClassAttribute(
    ['ReactVirtualized__Grid', 'ReactVirtualized__Grid__innerScrollContainer'],
    'role',
  );

  return ({
    users: UserListService.getUsers(),
    meetingIsBreakout: meetingIsBreakout(),
    setEmojiStatus: UserListService.setEmojiStatus,
    clearAllEmojiStatus: UserListService.clearAllEmojiStatus,
    roving: UserListService.roving,
    requestUserInformation: UserListService.requestUserInformation,
  });
})(UserParticipantsContainer);
