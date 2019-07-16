import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';

const getCurrentMeeting = () => Meetings.findOne({ meetingId: Auth.meetingID });

const toggleLockSettings = () => makeCall('toggleLockSettings', getCurrentMeeting());

const toggleWebcamsOnlyForModerator = () => makeCall('toggleWebcamsOnlyForModerator', getCurrentMeeting());

export default {
  toggleLockSettings,
  toggleWebcamsOnlyForModerator,
};
