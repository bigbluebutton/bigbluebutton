import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import ChatService from '/imports/ui/components/chat/service';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const UserParticipantsContainer = (props) => {
  const {
    getUsers: formatUsers,
    setEmojiStatus,
    clearAllEmojiStatus,
    roving,
    requestUserInformation,
  } = UserListService;

  const usingUsersContext = useContext(UsersContext);
  const { users: contextUsers } = usingUsersContext;
  const currentUser = contextUsers[Auth.meetingID][Auth.userID];
  const users = formatUsers(Object.values(contextUsers[Auth.meetingID]));

  return <UserParticipants {
    ...{
      currentUser,
      users,
      setEmojiStatus,
      clearAllEmojiStatus,
      roving,
      requestUserInformation,
      ...props,
    }
  } />;
};

export default withTracker(() => {
  ChatService.removePackagedClassAttribute(
    ['ReactVirtualized__Grid', 'ReactVirtualized__Grid__innerScrollContainer'],
    'role',
  );

  return ({
    meetingIsBreakout: meetingIsBreakout(),
  });
})(UserParticipantsContainer);
