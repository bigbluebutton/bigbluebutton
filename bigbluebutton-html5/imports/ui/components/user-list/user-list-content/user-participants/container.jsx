import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import UserListService from '/imports/ui/components/user-list/service';
import UserParticipants from './component';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import ChatService from '/imports/ui/components/chat/service';
import Auth from '/imports/ui/services/auth';
import useContextUsers from '/imports/ui/components/components-data/users-context/service';
import VideoService from '/imports/ui/components/video-provider/service';
import WhiteboardService from '/imports/ui/components/whiteboard/service';
import Meetings from '/imports/api/meetings';

const UserParticipantsContainer = (props) => {
  const {
    formatUsers,
    setEmojiStatus,
    clearAllEmojiStatus,
    roving,
    requestUserInformation,
  } = UserListService;

  const { videoUsers, whiteboardUsers } = props;
  const { users: contextUsers, isReady } = useContextUsers();

  const currentUser = contextUsers && isReady ? contextUsers[Auth.meetingID][Auth.userID] : null;
  const usersArray = contextUsers && isReady ? Object.values(contextUsers[Auth.meetingID]) : null;
  const users = contextUsers && isReady ? formatUsers(usersArray, videoUsers, whiteboardUsers) : [];

  return (
    <UserParticipants {
    ...{
      currentUser,
      users,
      setEmojiStatus,
      clearAllEmojiStatus,
      roving,
      requestUserInformation,
      isReady,
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
  const currentMeeting = Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { lockSettingsProps: 1 } });

  const isMeetingMuteOnStart = () => {
    const { voiceProp } = Meetings.findOne({ meetingId: Auth.meetingID },
      { fields: { 'voiceProp.muteOnStart': 1 } });
    const { muteOnStart } = voiceProp;
    return muteOnStart;
  };
  
  return ({
    isMeetingMuteOnStart: isMeetingMuteOnStart(),
    meetingIsBreakout: meetingIsBreakout(),
    videoUsers: VideoService.getUsersIdFromVideoStreams(),
    whiteboardUsers,
    isThisMeetingLocked: UserListService.isMeetingLocked(Auth.meetingID),
    lockSettingsProps: currentMeeting && currentMeeting.lockSettingsProps,
  });
})(UserParticipantsContainer);
