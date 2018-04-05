import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import mapUser from '/imports/ui/services/user/mapUser';
import VideoDock from './component';
import VideoService from '../service';

const VideoDockContainer = ({ children, ...props }) => <VideoDock {...props}>{children}</VideoDock>;

export default withTracker(({ sharedWebcam }) => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const lockCam = meeting.lockSettingsProp ? meeting.lockSettingsProp.disableCam : false;
  const userId = Auth.userID;
  const currentUser = Users.findOne({ userId });
  const currentUserIsModerator = mapUser(currentUser).isModerator;

  const isSharingWebcam = user => user.isSharingWebcam || (sharedWebcam && user.isCurrent);
  const isNotLocked = user => !(lockCam && user.isLocked);


  const isWebcamOnlyModerator = VideoService.webcamOnlyModerator();
  const allowedSeeViewersWebcams = !isWebcamOnlyModerator || currentUserIsModerator;
  const webcamOnlyModerator = (user) => {
    if (allowedSeeViewersWebcams) return true;
    return user.isModerator || user.isCurrent;
  };

  const users = VideoService.getAllUsers()
    .map(mapUser)
    .filter(isSharingWebcam)
    .filter(isNotLocked)
    .filter(webcamOnlyModerator);

  return {
    users,
    userId,
  };
})(VideoDockContainer);
