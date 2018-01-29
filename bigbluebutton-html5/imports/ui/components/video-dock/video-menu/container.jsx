import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import mapUser from '/imports/ui/services/user/mapUser';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import JoinVideoOptions from './component';
import VideoMenuService from './service';
import VideoService from '../service';

const JoinVideoOptionsContainer = props => <JoinVideoOptions {...props} />;

export default withTracker((params) => {
  const isSharingVideo = VideoMenuService.isSharingVideo();
  const isWaitingResponse = VideoService.isWaitingResponse();
  const isConnected = VideoService.isConnected();

  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const LockCam = meeting.lockSettingsProp ? meeting.lockSettingsProp.disableCam : false;
  const user = Users.findOne({ userId: Auth.userID });
  const userLocked = mapUser(user).isLocked;

  return {
    isSharingVideo,
    isWaitingResponse,
    isConnected,
    handleJoinVideo: params.handleJoinVideo,
    handleCloseVideo: params.handleCloseVideo,
    isLocked: LockCam && userLocked,
  };
})(JoinVideoOptionsContainer);
