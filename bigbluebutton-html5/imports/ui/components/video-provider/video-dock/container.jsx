import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Auth from '/imports/ui/services/auth';
import mapUser from '../../../services/user/mapUser';
import Meetings from '/imports/api/meetings/';
import Users from '/imports/api/users/';
import VideoDock from './component';
import VideoService from '../service';

const VideoDockContainer = ({ children, ...props }) => <VideoDock {...props}>{children}</VideoDock>;

export default withTracker(({sharedWebcam}) => {
  const meeting = Meetings.findOne({ meetingId: Auth.meetingID });
  const lockCam = meeting.lockSettingsProp ? meeting.lockSettingsProp.disableCam : false;
  const userId = Auth.userID;
  const user = Users.findOne({ userId });
  const userLocked = mapUser(user).isLocked;

  const withActiveStreams = (users) => {
    const activeFilter = (user) => {
      const isLocked = lockCam && user.locked;
      return !isLocked && (user.has_stream || (sharedWebcam && user.userId == userId));
    };

    return users.filter(activeFilter);
  }

  const users = withActiveStreams(VideoService.getAllUsers());

  return {
    users,
    userId
  };
})(VideoDockContainer);
