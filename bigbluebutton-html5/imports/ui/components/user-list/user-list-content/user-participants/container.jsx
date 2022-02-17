import React, { useContext } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import ChatService from '/imports/ui/components/chat/service';
import Auth from '/imports/ui/services/auth';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import VideoService from '/imports/ui/components/video-provider/service';
import WhiteboardService from '/imports/ui/components/whiteboard/service';

const UserParticipantsContainer = (props) => {
  const {
    formatUsers,
    setEmojiStatus,
    clearAllEmojiStatus,
    roving,
    requestUserInformation,
  } = UserListService;

  const { videoUsers, whiteboardUsers } = props;
  const usingUsersContext = useContext(UsersContext);
  const { users: contextUsers } = usingUsersContext;
  const currentUser = contextUsers[Auth.meetingID][Auth.userID];
  const usersArray = Object.values(contextUsers[Auth.meetingID]);
  const users = formatUsers(usersArray, videoUsers, whiteboardUsers);

  return (
    <UserParticipants {
    ...{
      currentUser,
      users,
      setEmojiStatus,
      clearAllEmojiStatus,
      roving,
      requestUserInformation,
      ...props,
    }
  }
    />
  );
};

export default withTracker(() => {
  ChatService.removePackagedClassAttribute(
    ['ReactVirtualized__Grid', 'ReactVirtualized__Grid__innerScrollContainer'],
    'role',
  );

  const whiteboardId = WhiteboardService.getCurrentWhiteboardId();
  const whiteboardUsers = whiteboardId ? WhiteboardService.getMultiUser(whiteboardId) : null;

  return ({
    meetingIsBreakout: meetingIsBreakout(),
    videoUsers: VideoService.getUsersIdFromVideoStreams(),
    whiteboardUsers,
  });
})(UserParticipantsContainer);
