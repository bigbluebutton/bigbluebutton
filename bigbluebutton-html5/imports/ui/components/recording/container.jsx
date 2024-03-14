import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { RecordMeetings } from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import { useMutation } from '@apollo/client';
import RecordingComponent from './component';
import { SET_RECORDING_STATUS } from './mutations';

const RecordingContainer = (props) => <RecordingComponent {...props} />;

export default withTracker(({ setIsOpen }) => {
  const { recording, time } = RecordMeetings.findOne({ meetingId: Auth.meetingID });

  const [setRecordingStatus] = useMutation(SET_RECORDING_STATUS);

  return ({
    toggleRecording: () => {
      setRecordingStatus({
        variables: {
          recording: !recording,
        },
      });
      setIsOpen(false);
    },
    recordingStatus: recording,
    recordingTime: time,
    isMeteorConnected: Meteor.status().connected,

  });
})(RecordingContainer);
