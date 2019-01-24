import Auth from '/imports/ui/services/auth';
import Breakouts from '/imports/api/breakouts';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';

const getBreakouts = () => Breakouts.find({}, { sort: { sequence: 1 } }).fetch();

const processOutsideToggleRecording = (e) => {
  switch (e.data) {
    case 'c_record': {
      makeCall('toggleRecording');
      break;
    }
    case 'c_recording_status': {
      const recordingState = Meetings.findOne({ meetingId: Auth.meetingID }).recordProp.recording;
      const recordingMessage = recordingState ? 'recordingStarted' : 'recordingStopped';
      this.window.parent.postMessage({ response: recordingMessage }, '*');
      break;
    }
    default: {
      // console.log(e.data);
    }
  }
};


const connectRecordingObserver = () => {
  // notify on load complete
  this.window.parent.postMessage({ response: 'readyToConnect' }, '*');
};

export default {
  connectRecordingObserver: () => connectRecordingObserver(),
  processOutsideToggleRecording: arg => processOutsideToggleRecording(arg),
  getBreakouts,
};

