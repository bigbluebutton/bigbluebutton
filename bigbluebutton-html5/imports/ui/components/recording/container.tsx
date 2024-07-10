import React from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import RecordingComponent from './component';
import { SET_RECORDING_STATUS } from './mutations';
import { GET_RECORDINGS, GetRecordingResponse } from './queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import ConnectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

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
    loading: recordingLoading,
    error: recordingError,
  } = useDeduplicatedSubscription<GetRecordingResponse>(GET_RECORDINGS);

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
    <RecordingComponent
      {...{
        amIModerator,
        connected,
        isOpen,
        recordingError,
        recordingLoading,
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
