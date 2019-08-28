import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { RecordMeetings } from '/imports/api/meetings';
import RecordIndicator from './component';
import Auth from '/imports/ui/services/auth';

const RecordIndicatorContainer = props => (
  <RecordIndicator {...props} />
);

export default withTracker(() => {
  const meetingId = Auth.meetingID;
  const recordObeject = RecordMeetings.findOne({ meetingId });

  RecordMeetings.find({ meetingId: Auth.meetingID }, { fields: { recording: 1 } }).observeChanges({
    changed: (id, fields) => {
      if (fields && fields.recording) {
        this.window.parent.postMessage({ response: 'recordingStarted' }, '*');
      }

      if (fields && !fields.recording) {
        this.window.parent.postMessage({ response: 'recordingStopped' }, '*');
      }
    },
  });

  return {
    allowStartStopRecording: !!(recordObeject && recordObeject.allowStartStopRecording),
    autoStartRecording: recordObeject && recordObeject.autoStartRecording,
    record: recordObeject && recordObeject.record,
    recording: recordObeject && recordObeject.recording,
    time: recordObeject && recordObeject.time,
  };
})(RecordIndicatorContainer);
