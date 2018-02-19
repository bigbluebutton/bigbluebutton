import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import mapUser from '../../../services/user/mapUser';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import VideoDock from './component';
import VideoService from '../service';

const VideoDockContainer = ({ children, ...props }) => <VideoDock {...props}>{children}</VideoDock>;

export default withTracker(() => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const lockCam = meeting.lockSettingsProp ? meeting.lockSettingsProp.disableCam : false;
  const user = Users.findOne({ userId: Auth.userID });
  const userLocked = mapUser(user).isLocked;

  return {
    users: VideoService.getAllUsers(),
    userId: VideoService.userId(),
    isLocked: userLocked && lockCam,
  };
})(VideoDockContainer);
