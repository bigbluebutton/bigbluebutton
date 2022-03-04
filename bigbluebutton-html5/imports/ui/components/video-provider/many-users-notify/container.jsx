import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users/';
import VideoStreams from '/imports/api/video-streams';
import LockViewersService from '/imports/ui/components/lock-viewers/service';
import ManyUsersComponent from './component';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;
const ROLE_VIEWER = USER_CONFIG.role_viewer;

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
    currentUserIsModerator: Users.findOne({ userId: Auth.userID },
      { fields: { role: 1 } })?.role === ROLE_MODERATOR,
    lockSettings: meeting.lockSettingsProps,
    webcamOnlyForModerator: meeting.usersProp.webcamsOnlyForModerator,
    limitOfViewersInWebcam: Meteor.settings.public.app.viewersInWebcam,
    limitOfViewersInWebcamIsEnable: Meteor.settings.public.app.enableLimitOfViewersInWebcam,
    toggleWebcamsOnlyForModerator: LockViewersService.toggleWebcamsOnlyForModerator,
  };
})(ManyUsersComponent);
