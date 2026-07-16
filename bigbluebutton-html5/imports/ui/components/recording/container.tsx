import React from 'react';
import { useMutation, useReactiveVar } from '@apollo/client';
import { SET_RECORDING_STATUS } from './mutations';
import { GetRecordingResponse } from './queries';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import ConnectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import { GET_MEETING_RECORDING_DATA } from '/imports/ui/components/nav-bar/nav-bar-graphql/recording-indicator/queries';
import Service from '/imports/ui/components/nav-bar/nav-bar-graphql/recording-indicator/service';
import RecordingComponent from './component';
import useMeeting from '../../core/hooks/useMeeting';

interface RecordingContainerProps {
  setIsOpen: (visible: boolean) => void;
  amIModerator: boolean;
  onRequestClose: () => void;
}

const RecordingContainer: React.FC<RecordingContainerProps> = (props) => {
  const {
    amIModerator, onRequestClose, setIsOpen,
  } = props;
  const [setRecordingStatus] = useMutation(SET_RECORDING_STATUS);
  // TODO: unused connected status variable, should we use it to disable the recording button?
  // @ts-expect-error TS6133: Unused variable.
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const connected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());
  const {
    data: recordingData,
    loading: recordingDataLoading,
  } = useDeduplicatedSubscription<GetRecordingResponse>(GET_MEETING_RECORDING_DATA);

  const {
    data: currentMeetingData,
  } = useMeeting((m) => ({
    recordingPolicies: m.recordingPolicies,
  }));

  const recording = recordingData?.meeting_recording[0]?.isRecording ?? false;
  const time = recordingData?.meeting_recording[0]?.previousRecordedTimeInSeconds ?? 0;
  const allowStartStopRecording = currentMeetingData?.recordingPolicies?.allowStartStopRecording ?? false;

  const toggleRecording = React.useCallback(() => {
    setRecordingStatus({
      variables: {
        recording: !recording,
      },
    });
    setIsOpen(false);
  }, [recording, setIsOpen, setRecordingStatus]);

  const mayIRecord = Service.mayIRecord(amIModerator, allowStartStopRecording);

  if (!mayIRecord || recordingDataLoading) return null;

  return (
    <>
      <RecordingComponent
        onRequestClose={onRequestClose}
        recordingStatus={recording}
        recordingTime={time}
        toggleRecording={toggleRecording}
      />
    </>
  );
};

export default RecordingContainer;
