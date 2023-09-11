import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import deviceInfo from '/imports/utils/deviceInfo';
import { useSubscription } from '@apollo/client';
import {
  GET_MEETING_RECORDING_DATA,
  GET_MEETING_RECORDING_POLICIES,
  getMeetingRecordingData,
  getMeetingRecordingPoliciesResponse,
  meetingRecordingAssertion,
  meetingRecordingPoliciesAssertion,
} from './queries';
import { useCurrentUser } from '/imports/ui/core/hooks/useCurrentUser';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import { notify } from '/imports/ui/services/notification';
import Styled from './styles';
import { User } from '/imports/ui/Types/user';
import { defineMessages, useIntl } from 'react-intl';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import RecordingNotify from './notify/component';
import RecordingContainer from '/imports/ui/components/recording/container';

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
});

interface RecordingIndicatorProps {
  allowStartStopRecording: boolean;
  autoStartRecording: boolean;
  record: boolean;
  recording: boolean;
  micUser: boolean;
  isPhone: boolean;
  recordingNotificationEnabled: boolean;
  serverTime: number;
  isModerator: boolean;
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
}) => {
  const intl = useIntl();
  const [isRecordingModalOpen, setIsRecordingModalOpen] = useState(false);
  const [isRecordingNotifyModalOpen, setIsRecordingNotifyModalOpen] = useState(false);
  const [shouldNotify, setShouldNotify] = useState(true);
  const [time, setTime] = useState(0);
  const setIntervalRef = React.useRef<ReturnType<typeof setTimeout>>();

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
      console.log('serverTime', serverTime);

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
  }, []);

  useEffect(() => {
    if (recordingNotificationEnabled) {
      // should only display notification modal when other modals are closed
      if (shouldNotify && recording) {
        setIsRecordingNotifyModalOpen(true);
      }
    }
  }, [shouldNotify, recordingNotificationEnabled, recording]);

  const recordTitle = useMemo(() => {
    if (!isPhone && !recording) {
      return time > 0
        ? intl.formatMessage(intlMessages.resumeTitle)
        : intl.formatMessage(intlMessages.startTitle);
    }
    return intl.formatMessage(intlMessages.stopTitle);
  }, [recording, isPhone]);

  const recordingIndicatorIcon = useMemo(() => (
    <Styled.RecordingIndicatorIcon
      titleMargin={!isPhone || recording}
      data-test="mainWhiteboard"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        height="100%"
        version="1"
        viewBox="0 0 20 20"
      >
        <g stroke="#FFF" fill="#FFF" strokeLinecap="square">
          <circle
            fill="none"
            strokeWidth="1"
            r="9"
            cx="10"
            cy="10"
          />
          <circle
            stroke="#FFF"
            fill="#FFF"
            r={recording ? '5' : '4'}
            cx="10"
            cy="10"
          />
        </g>
      </svg>
    </Styled.RecordingIndicatorIcon>
  ), [isPhone, recording]);

  const title = useMemo(() => intl.formatMessage(
    recording
      ? intlMessages.recordingIndicatorOn
      : intlMessages.recordingIndicatorOff,
  ), [recording]);

  const recordMeetingButton = useMemo(() => (
    <Styled.RecordingControl
      aria-label={recordTitle}
      aria-describedby="recording-description"
      recording={recording} // Removed the recording prop here
      role="button"
      tabIndex={0}
      key="recording-toggle"
      onClick={() => {
        recordingToggle(micUser, recording);
      }}
      onKeyPress={() => {
        recordingToggle(micUser, recording);
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
  ), [recording, micUser, time]);

  const recordMeetingButtonWithTooltip = useMemo(() => (
    <Tooltip title={intl.formatMessage(intlMessages.stopTitle)}>
      {recordMeetingButton}
    </Tooltip>
  ), [recording, micUser, time]);

  const recordingButton = recording ? recordMeetingButtonWithTooltip : recordMeetingButton;
  const showButton = isModerator && allowStartStopRecording;
  if (!record) return null;
  return (
    <>
      {record ? (
        <Styled.PresentationTitleSeparator aria-hidden="true">|</Styled.PresentationTitleSeparator>
      ) : null}
      <Styled.RecordingIndicator data-test="recordingIndicator">
        {showButton ? recordingButton : null}
        {showButton ? null : (
          <Tooltip
            title={`${intl.formatMessage(
              recording
                ? intlMessages.notificationRecordingStart
                : intlMessages.notificationRecordingStop
            )}`}
          >
            <Styled.RecordingStatusViewOnly
              aria-label={`${intl.formatMessage(
                recording
                  ? intlMessages.notificationRecordingStart
                  : intlMessages.notificationRecordingStop
              )}`}
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
          setIsOpen={setIsRecordingNotifyModalOpen}
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
    data: meetingRecordingPoliciesData,
    loading: meetingRecordingPoliciesLoading,
    error: meetingRecordingPoliciesError,
  } = useSubscription<getMeetingRecordingPoliciesResponse>(GET_MEETING_RECORDING_POLICIES);

  const {
    data: meetingRecordingData,
    loading: meetingRecordingLoading,
    error: meetingRecordingError,
  } = useSubscription<getMeetingRecordingData>(GET_MEETING_RECORDING_DATA);

  const currentUser = useCurrentUser((user: Partial<User>) => ({
    userId: user.userId,
    isModerator: user.isModerator,
    voice: user.voice
      ? {
        joined: user.voice.joined,
        listenOnly: user.voice.listenOnly,
      }
      : null,
  } as Partial<User>));

  const currentMeeting = useMeeting((meeting) => ({
    meetingId: meeting.meetingId,
    notifyRecordingIsOn: meeting.notifyRecordingIsOn,
  }));

  const [timeSync] = useTimeSync();

  if (meetingRecordingPoliciesLoading || meetingRecordingLoading) return null;
  if (meetingRecordingPoliciesError || meetingRecordingError) {
    return (
      <div>
        {JSON.stringify(meetingRecordingPoliciesError) ||
          JSON.stringify(meetingRecordingData)}
      </div>
    );
  }

  const meetingRecordingPolicies = meetingRecordingPoliciesData?.meeting_recordingPolicies[0];
  meetingRecordingPoliciesAssertion(meetingRecordingPolicies);

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
  const totalPassedTime: number =
    timeDifferenceMs / 1000 + (meetingRecording?.previousRecordedTimeInSeconds ?? 0);
  const passedTime = Math.floor(totalPassedTime);

  return (
    <RecordingIndicator
      allowStartStopRecording={meetingRecordingPolicies?.allowStartStopRecording ?? false}
      autoStartRecording={meetingRecordingPolicies?.autoStartRecording ?? false}
      record={meetingRecordingPolicies?.record ?? false}
      recording={meetingRecording?.isRecording ?? false}
      micUser={(currentUser?.voice && !currentUser?.voice.listenOnly) ?? false}
      isPhone={isMobile}
      recordingNotificationEnabled={
        (meetingRecording?.startedBy !== currentUser?.userId &&
          currentMeeting?.notifyRecordingIsOn) ??
        false
      }
      serverTime={passedTime > 0 ? passedTime : 0}
      isModerator={currentUser?.isModerator ?? false}
    />
  );
};

export default RecordingIndicatorContainer;
