import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { makeCall } from '/imports/ui/services/api';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import RecordingComponent from './component';

const RecordingContainer = props => <RecordingComponent {...props} />;

export default withModalMounter(withTracker(({ mountModal }) => ({
  closeModal() {
    mountModal(null);
  },

  toggleRecording: () => {
    makeCall('toggleRecording');
    mountModal(null);
  },

  recordingStatus: (Meetings.findOne({ meetingId: Auth.meetingID }).recordProp.recording),

}))(RecordingContainer));
