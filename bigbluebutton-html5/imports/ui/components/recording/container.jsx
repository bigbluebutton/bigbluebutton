import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { makeCall } from '/imports/ui/services/api';
import { RecordMeetings } from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import RecordingComponent from './component';

const RecordingContainer = props => <RecordingComponent {...props} />;

export default withTracker(({ setIsOpen }) => {
  const { recording, time } = RecordMeetings.findOne({ meetingId: Auth.meetingID });

  return ({
    toggleRecording: () => {
      makeCall('toggleRecording');
      setIsOpen(false);
    },

    recordingStatus: recording,
    recordingTime: time,
    isMeteorConnected: Meteor.status().connected,

  });
})(RecordingContainer);
