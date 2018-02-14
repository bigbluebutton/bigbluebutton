import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import mapUser from '/imports/ui/services/user/mapUser';
import VideoDock from './component';
import VideoService from './service';

const VideoDockContainer = ({ children, ...props }) => <VideoDock {...props}>{children}</VideoDock>;

export default withTracker(() => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const lockCam = meeting.lockSettingsProp ? meeting.lockSettingsProp.disableCam : false;
  const webcamOnlyModerator = meeting.usersProp.webcamsOnlyForModerator;
  const user = Users.findOne({ userId: Auth.userID });
  const mappedUser = mapUser(user);
  const userLocked = mappedUser.isLocked;
  const { isModerator } = mappedUser;
  const isLocked = (lockCam && userLocked);
  const users = VideoService.getAllUsers();
  const mappedUsers = users.map(u => mapUser(u));

  return {
    userId: VideoService.userId(),
    meetingId: Auth.meetingID,
    users,
    mappedUsers,
    isLocked,
    webcamOnlyModerator,
    isModerator,
  };
})(VideoDockContainer);
