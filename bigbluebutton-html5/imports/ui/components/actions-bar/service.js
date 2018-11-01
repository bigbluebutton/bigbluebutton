import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';

const processOutsideToggleRecording = (e) => {
  if (e.data === 'c_record') {
    const newRecordingState = Meetings.findOne({ meetingId: Auth.meetingID }).recordProp.recording;
    makeCall('toggleRecording')
      .then(() => {
        this.window.parent.postMessage({ response: { newRecordingState } }, '*');
      });
  }
};

export default {
  isUserPresenter: () => Users.findOne({ userId: Auth.userID }).presenter,
  isUserModerator: () => Users.findOne({ userId: Auth.userID }).moderator,
  recordSettingsList: () => Meetings.findOne({ meetingId: Auth.meetingID }).recordProp,
  toggleRecording: () => makeCall('toggleRecording'),
  processOutsideToggleRecording: arg => processOutsideToggleRecording(arg),
};
