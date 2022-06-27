import Auth from '/imports/ui/services/auth';
import Meetings from '/imports/api/meetings';

const isRecordingNotificationEnabled = () => (((
  Meetings.findOne(
    { meetingId: Auth.meetingID },
    {
      fields: { 'meetingProp.notifyRecordingIsOn': 1 },
    },
  ) || {}).meetingProp || {}).notifyRecordingIsOn || false);

export default {
  isRecordingNotificationEnabled,
};
