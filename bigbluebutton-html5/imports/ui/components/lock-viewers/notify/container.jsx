import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import LockViewersNotifyComponent from './component';

export default withTracker(() => {
  const Meeting = Meetings.findOne({
    meetingId: Auth.meetingID,
  });
  return {
    lockSettings: Meeting.lockSettingsProps,
    webcamsOnlyForModerator: Meeting.usersProp.webcamsOnlyForModerator,
  };
})(LockViewersNotifyComponent);
