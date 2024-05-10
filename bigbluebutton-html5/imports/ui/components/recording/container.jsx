import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import { useMutation, useSubscription } from '@apollo/client';
import RecordingComponent from './component';
import { SET_RECORDING_STATUS } from './mutations';
import { GET_RECORDINGS } from './queries';

const RecordingContainer = (props) => {
  const { setIsOpen } = props;
  const [setRecordingStatus] = useMutation(SET_RECORDING_STATUS);
  const {
    data: recordingData,
  } = useSubscription(GET_RECORDINGS);

  const recording = recordingData?.meeting_recording[0]?.isRecording ?? false;
  const time = recordingData?.meeting_recording[0]?.previousRecordedTimeInSeconds ?? 0;

  const toggleRecording = () => {
    setRecordingStatus({
      variables: {
        recording: !recording,
      },
    });
    setIsOpen(false);
  };
  return (
    <RecordingComponent {
      ...{
        recordingStatus: recording,
        recordingTime: time,
        toggleRecording,
        ...props,
      }
    }
    />
  );
};

export default withTracker(({ setIsOpen }) => ({
    isMeteorConnected: Meteor.status().connected,
    setIsOpen,
  }))(RecordingContainer);
