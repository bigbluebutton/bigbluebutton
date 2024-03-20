import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users/';
import VideoStreams from '/imports/api/video-streams';
import { useMutation } from '@apollo/client';
import ManyUsersComponent from './component';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_WEBCAM_ONLY_FOR_MODERATOR } from '/imports/ui/components/lock-viewers/mutations';

const USER_CONFIG = window.meetingClientSettings.public.user;
const ROLE_VIEWER = USER_CONFIG.role_viewer;

const ManyUsersContainer = (props) => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const [setWebcamOnlyForModerator] = useMutation(SET_WEBCAM_ONLY_FOR_MODERATOR);

  const toggleWebcamsOnlyForModerator = () => {
    setWebcamOnlyForModerator({
      variables: {
        webcamsOnlyForModerator: true,
      },
    });
  };

  const currentUserIsModerator = currentUserData?.isModerator;
  return <ManyUsersComponent {...{ toggleWebcamsOnlyForModerator, currentUserIsModerator, ...props }} />;
};

export default withTracker(() => {
  const meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  }, { fields: { 'usersPolicies.webcamsOnlyForModerator': 1, lockSettings: 1 } });
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
    lockSettings: meeting.lockSettings,
    webcamOnlyForModerator: meeting.usersPolicies.webcamsOnlyForModerator,
    limitOfViewersInWebcam: window.meetingClientSettings.public.app.viewersInWebcam,
    limitOfViewersInWebcamIsEnable: window.meetingClientSettings
      .public.app.enableLimitOfViewersInWebcam,
  };
})(ManyUsersContainer);
