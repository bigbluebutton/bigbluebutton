import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users/';
import VideoStreams from '/imports/api/video-streams';
import LockViewersService from '/imports/ui/components/lock-viewers/service';
import ManyUsersComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_VIEWER = USER_CONFIG.role_viewer;

const ManyUsersContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const currentUserIsModerator = currentUserData?.isModerator;
  return <ManyUsersComponent {...{ currentUserIsModerator, ...props }} />;
};

export default withTracker(() => {
  const meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  }, { fields: { 'usersProp.webcamsOnlyForModerator': 1, lockSettingsProps: 1 } });
  const videoStreams = VideoStreams.find({ meetingId: Auth.meetingID },
    { fields: { userId: 1 } }).fetch();
  const videoUsersIds = videoStreams.map(u => u.userId);
  return {
    viewersInWebcam: Users.find({
      meetingId: Auth.meetingID,
      userId: {
        $in: videoUsersIds,
      },
      role: ROLE_VIEWER,
      presenter: false,
    }, { fields: {} }).count(),
    lockSettings: meeting.lockSettingsProps,
    webcamOnlyForModerator: meeting.usersProp.webcamsOnlyForModerator,
    limitOfViewersInWebcam: Meteor.settings.public.app.viewersInWebcam,
    limitOfViewersInWebcamIsEnable: Meteor.settings.public.app.enableLimitOfViewersInWebcam,
    toggleWebcamsOnlyForModerator: LockViewersService.toggleWebcamsOnlyForModerator,
  };
})(ManyUsersContainer);
