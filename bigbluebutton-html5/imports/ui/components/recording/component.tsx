import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
import { v4 as uuid } from 'uuid';
import SvgIcon from '/imports/ui/components/common/icon-svg/component';
import Icon from '/imports/ui/components/common/icon/component';
import Styled from './styles';

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
  recordButtonLabel: {
    id: 'app.recording.recordButton',
    description: 'record button label',
  },
  stopButtonLabel: {
    id: 'app.recording.stopButton',
    description: 'stop button label',
  },
  cancelButtonLabel: {
    id: 'app.recording.cancelLabel',
    description: 'cancel button label',
  },
});

interface RecordingComponentProps {
  recordingStatus: boolean;
  recordingTime: number;
  toggleRecording: () => void;
  onRequestClose: () => void;
}

const RecordingComponent: React.FC<RecordingComponentProps> = ({
  recordingStatus, recordingTime, toggleRecording, onRequestClose,
}) => {
  const intl = useIntl();
  const [recordingToastId] = React.useState(() => `recording-confirmation-${uuid()}`);

  const isResuming = recordingTime > 0 && !recordingStatus;
  let notificationTitleMessage = intlMessages.startTitle;

  if (recordingStatus) {
    notificationTitleMessage = intlMessages.stopTitle;
  } else if (isResuming) {
    notificationTitleMessage = intlMessages.resumeTitle;
  }

  const notificationTitle = intl.formatMessage(notificationTitleMessage);
  const notificationDescription = intl.formatMessage(
    recordingStatus ? intlMessages.stopDescription : intlMessages.startDescription,
  );
  const cancelButtonLabel = intl.formatMessage(intlMessages.cancelButtonLabel);
  const confirmationButtonLabel = intl.formatMessage(
    recordingStatus ? intlMessages.stopButtonLabel : intlMessages.recordButtonLabel,
  );

  const dismissRecordingToast = React.useCallback(() => {
    toast.dismiss(recordingToastId);
  }, [recordingToastId]);

  const handleCancel = React.useCallback(() => {
    dismissRecordingToast();
    onRequestClose();
  }, [dismissRecordingToast, onRequestClose]);

  const handleConfirm = React.useCallback(() => {
    dismissRecordingToast();
    toggleRecording();
  }, [dismissRecordingToast, toggleRecording]);

  React.useEffect(() => {
    notify(
      <div>
        <Styled.TitleText>{notificationTitle}</Styled.TitleText>
        <Styled.DescriptionText>{notificationDescription}</Styled.DescriptionText>
      </div>,
      'default',
      false,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        disablePointer: true,
        toastId: recordingToastId,
      },
      (
        <Styled.NotificationContent>
          <Styled.NotificationActions>
            <Styled.CancelButton
              data-test="cancelRecordingButton"
              onClick={handleCancel}
            >
              {cancelButtonLabel}
            </Styled.CancelButton>
            <Styled.ConfirmationButton
              data-test="confirmRecordingButton"
              onClick={handleConfirm}
            >
              <Styled.SvgCapsule>
                {recordingStatus ? (
                  <Icon iconName="pause" />
                ) : (
                  <SvgIcon iconName="recording" />
                )}
              </Styled.SvgCapsule>
              {confirmationButtonLabel}
            </Styled.ConfirmationButton>
          </Styled.NotificationActions>
        </Styled.NotificationContent>
      ),
      false,
      false,
    );
  }, [
    cancelButtonLabel,
    confirmationButtonLabel,
    handleCancel,
    handleConfirm,
    notificationDescription,
    notificationTitle,
    recordingStatus,
    recordingToastId,
  ]);

  React.useEffect(() => {
    return () => {
      dismissRecordingToast();
    };
  }, [dismissRecordingToast]);

  return null;
};

export default RecordingComponent;
