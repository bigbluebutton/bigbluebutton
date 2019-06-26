import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings/';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users/';
import LockViewersService from '/imports/ui/components/lock-viewers/service';
import ManyUsersComponent from './component';

export default withTracker(() => ({
  viewersInWebcam: Users.find({
    meetingId: Auth.meetingID,
    hasStream: true,
    moderator: false,
    presenter: false,
  }).count(),
  currentUserIsModerator: Users.findOne({ userId: Auth.userID }).moderator,
  lockSettings: Meetings.findOne({ meetingId: Auth.meetingID }).lockSettingsProps,
  webcamOnlyForModerator: Meetings.findOne({
    meetingId: Auth.meetingID,
  }).usersProp.webcamsOnlyForModerator,
  limitOfViewersInWebcam: Meteor.settings.public.app.viewersInWebcam,
  limitOfViewersInWebcamIsEnable: Meteor.settings.public.app.enableLimitOfViewersInWebcam,
  toggleWebcamsOnlyForModerator: LockViewersService.toggleWebcamsOnlyForModerator,
}))(ManyUsersComponent);
