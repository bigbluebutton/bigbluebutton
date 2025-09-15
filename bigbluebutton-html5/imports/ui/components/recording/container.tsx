import React from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import RecordingComponent from './component';
import { SET_RECORDING_STATUS } from './mutations';
import { GetRecordingResponse } from './queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import ConnectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { GET_MEETING_RECORDING_DATA } from '/imports/ui/components/nav-bar/nav-bar-graphql/recording-indicator/queries';
import Service from '/imports/ui/components/nav-bar/nav-bar-graphql/recording-indicator/service';
import useMeeting from '../../core/hooks/useMeeting';

interface RecordingContainerProps {
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
  amIModerator: boolean;
  onRequestClose: () => void;
  priority: string;
  isOpen: boolean;
}

const RecordingContainer: React.FC<RecordingContainerProps> = (props) => {
  const {
    amIModerator, isOpen, onRequestClose, priority, setIsOpen,
  } = props;
  const [setRecordingStatus] = useMutation(SET_RECORDING_STATUS);
  const connected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());
  const {
    data: recordingData,
  } = useDeduplicatedSubscription<GetRecordingResponse>(GET_MEETING_RECORDING_DATA);

  const {
    data: currentMeetingData,
  } = useMeeting((m) => ({
    recordingPolicies: m.recordingPolicies,
  }));

  const recording = recordingData?.meeting_recording[0]?.isRecording ?? false;
  const time = recordingData?.meeting_recording[0]?.previousRecordedTimeInSeconds ?? 0;
  const allowStartStopRecording = currentMeetingData?.recordingPolicies?.allowStartStopRecording ?? false;

  const toggleRecording = () => {
    setRecordingStatus({
      variables: {
        recording: !recording,
      },
    });
    setIsOpen(false);
  };

  const mayIRecord = Service.mayIRecord(amIModerator, allowStartStopRecording);

  if (!mayIRecord) return null;

  return (
    <RecordingComponent
      {...{
        connected,
        isOpen,
        onRequestClose,
        priority,
        recordingTime: time,
        recordingStatus: recording,
        setIsOpen,
        toggleRecording,
      }}
    />
  );
};

export default RecordingContainer;
