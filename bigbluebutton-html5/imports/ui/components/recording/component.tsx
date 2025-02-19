import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { notify } from '/imports/ui/services/notification';
import { toast } from 'react-toastify';
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

  const handleShowNotification = () => {
    const isResuming = recordingTime > 0 && !recordingStatus;
    let title;

    if (recordingStatus) {
      title = intl.formatMessage(intlMessages.stopTitle);
    } else if (isResuming) {
      title = intl.formatMessage(intlMessages.resumeTitle);
    } else {
      title = intl.formatMessage(intlMessages.startTitle);
    }

    const description = recordingStatus
      ? intl.formatMessage(intlMessages.stopDescription)
      : intl.formatMessage(intlMessages.startDescription);

    const toastId = notify(
      <div>
        <Styled.TitleText>{title}</Styled.TitleText>
        <Styled.DescriptionText>{description}</Styled.DescriptionText>
      </div>,
      'default',
      false,
      {
        autoClose: false,
        closeButton: false,
        closeOnClick: false,
        disablePointer: true,
      },
      (
        <Styled.NotificationContent>
          <Styled.NotificationActions>
            <Styled.CancelButton
              data-test="cancelRecordingButton"
              onClick={() => {
                if (toastId !== null) {
                  toast.dismiss(toastId);
                }
                onRequestClose();
              }}
            >
              {intl.formatMessage(intlMessages.cancelButtonLabel)}
            </Styled.CancelButton>
            <Styled.ConfirmationButton
              data-test="confirmRecordingButton"
              onClick={() => {
                if (toastId !== null) {
                  toast.dismiss(toastId);
                }
                toggleRecording();
              }}
            >
              <Styled.SvgCapsule>
                {recordingStatus ? (
                  <Icon iconName="pause" />
                ) : (
                  <SvgIcon iconName="recording" />
                )}
              </Styled.SvgCapsule>
              {recordingStatus
                ? intl.formatMessage(intlMessages.stopButtonLabel)
                : intl.formatMessage(intlMessages.recordButtonLabel)}
            </Styled.ConfirmationButton>
          </Styled.NotificationActions>
        </Styled.NotificationContent>
      ),
      false,
      false,
    );
  };

  React.useEffect(() => {
    handleShowNotification();
  }, [recordingStatus]);

  return null;
};

export default RecordingComponent;
