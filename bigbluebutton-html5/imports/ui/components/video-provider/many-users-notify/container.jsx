import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings/';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users/';
import LockViewersService from '/imports/ui/components/lock-viewers/service';
import ManyUsersComponent from './component';

const USER_CONFIG = Meteor.settings.public.user;
const ROLE_MODERATOR = USER_CONFIG.role_moderator;
const ROLE_VIEWER = USER_CONFIG.role_viewer;

export default withTracker(() => ({
  viewersInWebcam: Users.find({
    meetingId: Auth.meetingID,
    hasStream: true,
    role: ROLE_VIEWER,
    presenter: false,
  }, { fields: {} }).count(),
  currentUserIsModerator: Users.findOne({ userId: Auth.userID },
    { fields: { role: 1 } }).role === ROLE_MODERATOR,
  lockSettings: Meetings.findOne({ meetingId: Auth.meetingID },
    { fields: { lockSettingsProps: 1 } }).lockSettingsProps,
  webcamOnlyForModerator: Meetings.findOne({
    meetingId: Auth.meetingID,
  }, { fields: { 'usersProp.webcamsOnlyForModerator': 1 } }).usersProp.webcamsOnlyForModerator,
  limitOfViewersInWebcam: Meteor.settings.public.app.viewersInWebcam,
  limitOfViewersInWebcamIsEnable: Meteor.settings.public.app.enableLimitOfViewersInWebcam,
  toggleWebcamsOnlyForModerator: LockViewersService.toggleWebcamsOnlyForModerator,
}))(ManyUsersComponent);
