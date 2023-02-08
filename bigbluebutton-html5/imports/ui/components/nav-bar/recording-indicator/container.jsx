import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { RecordMeetings } from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { notify } from '/imports/ui/services/notification';
import VoiceUsers from '/imports/api/voice-users';
import RecordIndicator from './component';
import deviceInfo from '/imports/utils/deviceInfo';
import RecordingIndicatorService from './service';

const RecordIndicatorContainer = (props) => (
  <RecordIndicator {...props} />
);

export default withTracker(({ currentUserId }) => {
  const meetingId = Auth.meetingID;
  const recordObject = RecordMeetings.findOne({ meetingId });
  const recordSetByUser = recordObject?.setBy === currentUserId;

  const micUser = VoiceUsers.findOne({ meetingId, joined: true, listenOnly: false }, {
    fields: {
      joined: 1,
    },
  });

  return {
    allowStartStopRecording: !!(recordObject && recordObject.allowStartStopRecording),
    autoStartRecording: recordObject && recordObject.autoStartRecording,
    record: recordObject && recordObject.record,
    recording: recordObject && recordObject.recording,
    time: recordObject && recordObject.time,
    notify,
    micUser,
    isPhone: deviceInfo.isPhone,
    recordingNotificationEnabled: !recordSetByUser && RecordingIndicatorService.isRecordingNotificationEnabled(),
  };
})(RecordIndicatorContainer);
