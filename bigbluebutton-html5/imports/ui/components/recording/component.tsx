import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';

const intlMessages = defineMessages({
  startTitle: {
    id: 'app.recording.startTitle',
    description: 'start recording title',
  },
  stopTitle: {
    id: 'app.recording.stopTitle',
    description: 'stop recording title',
  },
  resumeTitle: {
    id: 'app.recording.resumeTitle',
    description: 'resume recording title',
  },
  startDescription: {
    id: 'app.recording.startDescription',
    description: 'start recording description',
  },
  stopDescription: {
    id: 'app.recording.stopDescription',
    description: 'stop recording description',
  },
  loadingTitle: {
    id: 'app.recording.loadingTitle',
    description: 'recording data is loading',
  },
  loadingDescription: {
    id: 'app.recording.loadingDescription',
    description: 'recording data is loading',
  },
  cancelLabel: {
    id: 'app.recording.cancelLabel',
    description: 'cancel button label',
  },
});

interface RecordingComponentProps {
  amIModerator: boolean;
  connected: boolean;
  isOpen: boolean;
  recordingLoading: boolean;
  recordingStatus: boolean,
  priority: string;
  recordingTime: number,
  onRequestClose: () => void;
  toggleRecording: () => void,
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const RecordingComponent: React.FC<RecordingComponentProps> = (props) => {
  const {
    amIModerator,
    connected,
    isOpen,
    recordingLoading,
    recordingStatus,
    recordingTime,
    priority,
    onRequestClose,
    toggleRecording,
    setIsOpen,
  } = props;

  const intl = useIntl();

  let title;
  let description;
  let cancelButtonLabel;

  if (!amIModerator) return null;

  if (recordingLoading) {
    title = intl.formatMessage(intlMessages.loadingTitle);
    description = intl.formatMessage(intlMessages.loadingDescription);
    cancelButtonLabel = intl.formatMessage(intlMessages.cancelLabel);
  } else if (recordingStatus) {
    description = intl.formatMessage(intlMessages.stopDescription);
    title = intl.formatMessage(intlMessages.stopTitle);
  } else {
    description = intl.formatMessage(intlMessages.startDescription);
    title = recordingTime > 0
      ? intl.formatMessage(intlMessages.resumeTitle)
      : intl.formatMessage(intlMessages.startTitle);
  }

  return (
    <ConfirmationModal
      intl={intl}
      onConfirm={toggleRecording}
      title={title}
      description={description}
      disableConfirmButton={!connected}
      hideConfirmButton={recordingLoading}
      cancelButtonLabel={cancelButtonLabel}
      {...{
        isOpen,
        onRequestClose,
        priority,
        setIsOpen,
      }}
    />
  );
};

export default RecordingComponent;
