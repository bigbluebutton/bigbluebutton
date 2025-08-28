import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import deviceInfo, { isMobile } from '/imports/utils/deviceInfo';
import { defineMessages, useIntl } from 'react-intl';
import {
  GET_MEETING_RECORDING_DATA,
  getMeetingRecordingData,
  meetingRecordingAssertion,
} from './queries';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import { notify } from '/imports/ui/services/notification';
import Styled from './styles';
import { User } from '/imports/ui/Types/user';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import RecordingNotify from './notify/component';
import RecordingContainer from '/imports/ui/components/recording/container';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import logger from '/imports/startup/client/logger';
import SvgIcon from '/imports/ui/components/common/icon-svg/component';
import Service from './service';

const intlMessages = defineMessages({
  notificationRecordingStart: {
    id: 'app.notification.recordingStart',
    description: 'Notification for when the recording starts',
  },
  notificationRecordingStop: {
    id: 'app.notification.recordingStop',
    description: 'Notification for when the recording stops',
  },
  recordingAriaLabel: {
    id: 'app.notification.recordingAriaLabel',
    description: 'Notification for when the recording stops',
  },
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
  recordingIndicatorOn: {
    id: 'app.navBar.recording.on',
    description: 'label for indicator when the session is being recorded',
  },
  recordingIndicatorOff: {
    id: 'app.navBar.recording.off',
    description: 'label for indicator when the session is not being recorded',
  },
  emptyAudioBrdige: {
    id: 'app.navBar.emptyAudioBrdige',
    description: 'message for notification when recording starts with no users in audio bridge',
  },
  errorDescription: {
    id: 'app.recording.errorDescription',
    description: 'recording data error',
  },
  loadingDescription: {
    id: 'app.recording.loadingDescription',
    description: 'recording data is loading',
  },
  unavailableTitle: {
    id: 'app.navBar.recording.unavailable',
    description: 'recording data is either loading or failed to load',
  },
});

interface RecordingIndicatorProps {
  allowStartStopRecording: boolean;
  // eslint-disable-next-line react/no-unused-prop-types
  autoStartRecording: boolean;
  record: boolean;
  recording: boolean;
  micUser: boolean;
  isPhone: boolean;
  recordingNotificationEnabled: boolean;
  serverTime: number;
  isModerator: boolean;
  hasError: boolean;
  isLoading: boolean;
}

const RecordingIndicator: React.FC<RecordingIndicatorProps> = ({
  isPhone,
  recording,
  micUser,
  serverTime,
  allowStartStopRecording,
  isModerator,
  record,
  recordingNotificationEnabled,
  hasError,
  isLoading,
}) => {
  const intl = useIntl();
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isRecordingNotifyModalOpen, setIsRecordingNotifyModalOpen] = useState(false);
  const [shouldNotify, setShouldNotify] = useState(true);
  const [time, setTime] = useState(0);
  const setIntervalRef = React.useRef<ReturnType<typeof setTimeout>>();
  const disabled = hasError || isLoading;

  const recordingToggle = useCallback((hasMicUser: boolean, isRecording: boolean) => {
    if (!hasMicUser && !isRecording) {
      notify(intl.formatMessage(intlMessages.emptyAudioBrdige), 'error', 'warning');
    }
    setIsRecordingModalOpen(true);
    const focusedElement = document.activeElement as HTMLElement;
    focusedElement.blur();
  }, []);

  useEffect(() => {
    if (recording) {
      setTime(serverTime);
      clearInterval(setIntervalRef.current);
      setIntervalRef.current = setInterval(() => {
        setTime((currentTime) => currentTime + 1);
      }, 1000);
    }
    if (!recording) {
      clearInterval(setIntervalRef.current);
    }
    return () => {
      clearInterval(setIntervalRef.current);
    };
  }, [recording]);

  useEffect(() => {
    if (recordingNotificationEnabled && recording) {
      setShouldNotify(true);
    }
  }, [recordingNotificationEnabled, recording]);

  useEffect(() => {
    if (recordingNotificationEnabled) {
      // should only display notification modal when other modals are closed
      if (shouldNotify && recording) {
        setIsRecordingNotifyModalOpen(true);
      }
    }
  }, [shouldNotify, recordingNotificationEnabled, recording]);

  const recordTitle = useMemo(() => {
    if (isPhone) return '';
    if (disabled) return intl.formatMessage(intlMessages.unavailableTitle);
    if (!recording) {
      return time > 0
        ? intl.formatMessage(intlMessages.resumeTitle)
        : intl.formatMessage(intlMessages.startTitle);
    }
    return intl.formatMessage(intlMessages.stopTitle);
  }, [recording, isPhone, disabled, intl.locale]);

  const recordingIndicatorIcon = useMemo(() => (
    <Styled.RecordingIndicatorIcon
      titleMargin={!isPhone || recording}
      data-test="mainWhiteboard"
    >
      <SvgIcon iconName="recording" />
    </Styled.RecordingIndicatorIcon>
  ), [isPhone, recording]);

  const title = useMemo(() => intl.formatMessage(
    recording
      ? intlMessages.recordingIndicatorOn
      : intlMessages.recordingIndicatorOff,
  ), [recording]);

  let recordMeetingButton = (
    <Styled.RecordingControl
      aria-label={recordTitle}
      aria-describedby="recording-description"
      recording={recording} // Removed the recording prop here
      disabled={disabled}
      tabIndex={0}
      key="recording-toggle"
      onClick={() => {
        recordingToggle(micUser, recording);
      }}
      onKeyDown={(ev) => {
        if (ev.key !== 'Tab') {
          ev.preventDefault();
        }
        if (ev.key === 'Enter') {
          recordingToggle(micUser, recording);
        }
      }}
    >
      {recordingIndicatorIcon}
      <Styled.PresentationTitle>
        <Styled.VisuallyHidden id="recording-description">
          {`${title} ${recording ? humanizeSeconds(time) : ''}`}
        </Styled.VisuallyHidden>
        {recording ? (
          <span aria-hidden>{humanizeSeconds(time)}</span>
        ) : (
          <span>{recordTitle}</span>
        )}
      </Styled.PresentationTitle>
    </Styled.RecordingControl>
  );

  const recordMeetingButtonWithTooltip = (
    <Tooltip title={intl.formatMessage(intlMessages.stopTitle)}>
      {recordMeetingButton}
    </Tooltip>
  );

  if (disabled) {
    recordMeetingButton = (
      <Tooltip
        title={
          isLoading
            ? intl.formatMessage(intlMessages.loadingDescription)
            : intl.formatMessage(intlMessages.errorDescription)
        }
      >
        <span>
          {recordMeetingButton}
        </span>
      </Tooltip>
    );
  }

  const recordingButton = recording ? recordMeetingButtonWithTooltip : recordMeetingButton;
  const showButton = Service.mayIRecord(isModerator, allowStartStopRecording);
  const defaultRecordTooltip = intl.formatMessage(intlMessages.notificationRecordingStop);
  const customRecordTooltip = Service.getCustomRecordTooltip(defaultRecordTooltip);
  if (!record) return null;
  return (
    <>
      {record && !isMobile ? (
        <Styled.PresentationTitleSeparator aria-hidden="true">|</Styled.PresentationTitleSeparator>
      ) : null}
      <Styled.RecordingIndicator
        data-test="recordingIndicator"
        isPhone={isMobile}
        recording={recording}
        disabled={!showButton}
      >
        {showButton ? recordingButton : null}
        {showButton ? null : (
          <Tooltip
            title={recording
              ? `${intl.formatMessage(intlMessages.notificationRecordingStart)}`
              : customRecordTooltip}
          >
            <Styled.RecordingStatusViewOnly
              aria-label={recording
                ? `${intl.formatMessage(intlMessages.notificationRecordingStart)}`
                : customRecordTooltip}
              recording={recording}
            >
              {recordingIndicatorIcon}
              {recording ? (
                <Styled.PresentationTitle>
                  {humanizeSeconds(time)}
                </Styled.PresentationTitle>
              ) : null}
            </Styled.RecordingStatusViewOnly>
          </Tooltip>
        )}
      </Styled.RecordingIndicator>
      {isRecordingNotifyModalOpen ? (
        <RecordingNotify
          toggleShouldNotify={() => {
            setShouldNotify((prev) => !prev);
          }}
          priority="high"
          isOpen={isRecordingNotifyModalOpen}
          closeModal={() => {
            setIsRecordingNotifyModalOpen(false);
            setShouldNotify(false);
          }}
        />
      ) : null}
      {isRecordingModalOpen ? (
        <RecordingContainer
          amIModerator={isModerator}
          onRequestClose={() => setIsRecordingModalOpen(false)}
          priority="high"
          setIsOpen={setIsRecordingModalOpen}
          isOpen={isRecordingModalOpen}
        />
      ) : null}
    </>
  );
};

const RecordingIndicatorContainer: React.FC = () => {
  const { isMobile } = deviceInfo;

  const {
    data: meetingRecordingData,
    loading: meetingRecordingLoading,
    error: meetingRecordingError,
  } = useDeduplicatedSubscription<getMeetingRecordingData>(GET_MEETING_RECORDING_DATA);

  const { data: currentUser } = useCurrentUser((user: Partial<User>) => ({
    userId: user.userId,
    isModerator: user.isModerator,
    voice: user.voice
      ? {
        joined: user.voice.joined,
        listenOnly: user.voice.listenOnly,
      }
      : null,
  } as Partial<User>));

  const {
    data: currentMeeting,
    errors: currentMeetingErrors,
    loading: currentMeetingLoading,
  } = useMeeting((meeting) => ({
    meetingId: meeting.meetingId,
    notifyRecordingIsOn: meeting.notifyRecordingIsOn,
    recordingPolicies: meeting.recordingPolicies,
  }));

  const [timeSync] = useTimeSync();
  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;

  if (meetingRecordingLoading) {
    return (
      <>
        <Styled.PresentationTitleSeparator aria-hidden="true">|</Styled.PresentationTitleSeparator>
        <div>
          <Styled.SpinnerOverlay animations={animations}>
            <Styled.Bounce1 animations={animations} />
            <Styled.Bounce2 animations={animations} />
          </Styled.SpinnerOverlay>
        </div>
      </>
    );
  }

  if (meetingRecordingError) {
    logger.error({
      logCode: 'meeting_recording_sub_error',
      extraInfo: {
        errorName: meetingRecordingError.name,
        errorMessage: meetingRecordingError.message,
      },
    }, 'Meeting recording subscription failed.');
  }

  const meetingRecording = meetingRecordingData?.meeting_recording[0] || {
    isRecording: false,
    previousRecordedTimeInSeconds: 0,
    startedAt: '',
    startedBy: '',
  };
  meetingRecordingAssertion(meetingRecording);

  const currentDate: Date = new Date();
  const startedAt: Date = new Date(meetingRecording?.startedAt ?? '');
  const adjustedCurrent: Date = new Date(currentDate.getTime() + timeSync);
  const timeDifferenceMs: number = adjustedCurrent.getTime() - startedAt.getTime();
  const totalPassedTime: number = timeDifferenceMs / 1000 + (meetingRecording?.previousRecordedTimeInSeconds ?? 0);
  const passedTime = Math.floor(totalPassedTime);

  return (
    <RecordingIndicator
      allowStartStopRecording={currentMeeting?.recordingPolicies?.allowStartStopRecording ?? false}
      autoStartRecording={currentMeeting?.recordingPolicies?.autoStartRecording ?? false}
      record={currentMeeting?.recordingPolicies?.record ?? false}
      recording={meetingRecording?.isRecording ?? false}
      micUser={(currentUser?.voice && !currentUser?.voice.listenOnly) ?? false}
      isPhone={isMobile}
      recordingNotificationEnabled={
        (meetingRecording?.startedBy !== currentUser?.userId
          && currentMeeting?.notifyRecordingIsOn)
          ?? false
      }
      serverTime={passedTime > 0 ? passedTime : 0}
      isModerator={currentUser?.isModerator ?? false}
      hasError={Boolean(currentMeetingErrors || meetingRecordingError)}
      isLoading={currentMeetingLoading || meetingRecordingLoading}
    />
  );
};

export default RecordingIndicatorContainer;
