import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useWhoIsTalking from '/imports/ui/core/hooks/useWhoIsTalking';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import useTimeSync from '/imports/ui/core/local-states/useTimeSync';
import {
  GET_MEETING_RECORDING_DATA,
  getMeetingRecordingData,
} from '/imports/ui/components/nav-bar/nav-bar-graphql/recording-indicator/queries';
import RecordingIndicatorService from '/imports/ui/components/nav-bar/nav-bar-graphql/recording-indicator/service';
import { SET_RECORDING_STATUS } from '/imports/ui/components/recording/mutations';
import useSmartTrigger from '../hooks/useSmartTrigger';
import useLocalAudioState from '../hooks/useLocalAudioState';
import {
  getRecordingStartCheckDelayMs,
  getSmartTriggersSettings,
  requestAudioSettings,
} from '../service';
import { CooldownPolicy, HintAction, RecordingSilence } from '../types';

const intlMessages = defineMessages({
  startMessage: {
    id: 'app.smartTriggers.recordingWithNoSpeech.startMessage',
    description: 'Hint shown to moderators when a recording starts with a microphone on and nobody heard',
  },
  silenceMessageSingular: {
    id: 'app.smartTriggers.recordingWithNoSpeech.silenceMessageSingular',
    description: 'Hint shown to moderators when nobody is heard for one minute of a recording',
  },
  silenceMessagePlural: {
    id: 'app.smartTriggers.recordingWithNoSpeech.silenceMessagePlural',
    description: 'Hint shown to moderators when nobody is heard for several minutes of a recording',
  },
  checkAudio: {
    id: 'app.smartTriggers.recordingWithNoSpeech.action.checkAudio',
    description: 'Action that opens the audio settings',
  },
  pauseRecording: {
    id: 'app.smartTriggers.recordingWithNoSpeech.action.pauseRecording',
    description: 'Action that pauses the recording',
  },
});

// The silence count restarts whenever the hint shows, which already spaces it
// out, so the hint needs no cooldown.
const COOLDOWN: CooldownPolicy = { kind: 'time', ms: 0 };
const SILENCE_CHECK_INTERVAL_MS = 30000;

const useRecordingWithNoSpeechRule = () => {
  const intl = useIntl();
  const { startCheckSeconds, maxSilenceMinutes } = getSmartTriggersSettings().recordingWithNoSpeech;
  const { fire, clear } = useSmartTrigger('recordingWithNoSpeech', COOLDOWN);
  const [setRecordingStatus] = useMutation(SET_RECORDING_STATUS);
  const { isConnected } = useLocalAudioState();
  const { data: currentUser } = useCurrentUser((u) => ({ isModerator: u.isModerator }));
  const { data: meeting } = useMeeting((m) => ({ recordingPolicies: m.recordingPolicies }));
  const isModerator = !!currentUser?.isModerator;
  const { data: recordingData } = useDeduplicatedSubscription<getMeetingRecordingData>(
    GET_MEETING_RECORDING_DATA,
    { skip: !isModerator },
  );
  const { data: talkingUsers } = useWhoIsTalking();
  const { data: unmutedUsers } = useWhoIsUnmuted();
  const [timeSync] = useTimeSync();
  const [silence, setSilence] = useState<RecordingSilence | null>(null);
  const heardRef = useRef(false);
  const silentSinceRef = useRef(0);
  const anyoneTalkingRef = useRef(false);
  const anyoneUnmutedRef = useRef(false);
  const timeSyncRef = useRef(timeSync);

  const recording = recordingData?.meeting_recording?.[0];
  const isRecording = isModerator && !!recording?.isRecording;
  const startedAt = recording?.startedAt;
  const anyoneTalking = Object.values(talkingUsers ?? {}).some(Boolean);
  const mayPauseRecording = RecordingIndicatorService.mayIRecord(
    isModerator,
    !!meeting?.recordingPolicies?.allowStartStopRecording,
  );

  anyoneTalkingRef.current = anyoneTalking;
  anyoneUnmutedRef.current = Object.values(unmutedUsers ?? {}).some(Boolean);
  timeSyncRef.current = timeSync;

  useEffect(() => {
    if (!anyoneTalking) return;
    heardRef.current = true;
    silentSinceRef.current = Date.now();
    setSilence(null);
  }, [anyoneTalking]);

  useEffect(() => {
    setSilence(null);
    if (!isRecording || !startedAt) return undefined;

    // Someone already talking when watching starts, or talking without pause,
    // produces no new event, so the checks also count who talks at that moment.
    heardRef.current = anyoneTalkingRef.current;
    silentSinceRef.current = Date.now();

    const report = (kind: RecordingSilence['kind']) => {
      const now = Date.now();
      silentSinceRef.current = now;
      if (anyoneUnmutedRef.current) setSilence({ kind, at: now });
    };

    const startCheckDelayMs = getRecordingStartCheckDelayMs(
      startedAt,
      startCheckSeconds,
      Date.now() + timeSyncRef.current,
    );
    const startCheck = startCheckDelayMs === null ? undefined : setTimeout(() => {
      if (!heardRef.current && !anyoneTalkingRef.current) report('start');
    }, startCheckDelayMs);

    const silenceCheck = setInterval(() => {
      if (anyoneTalkingRef.current) silentSinceRef.current = Date.now();
      if (Date.now() - silentSinceRef.current >= maxSilenceMinutes * 60000) report('silence');
    }, SILENCE_CHECK_INTERVAL_MS);

    return () => {
      clearTimeout(startCheck);
      clearInterval(silenceCheck);
    };
  }, [isRecording, startedAt, startCheckSeconds, maxSilenceMinutes]);

  useEffect(() => {
    if (!silence) {
      clear();
      return;
    }
    const actions: HintAction[] = [];
    if (isConnected) {
      actions.push({
        id: 'checkAudio',
        label: intl.formatMessage(intlMessages.checkAudio),
        onClick: requestAudioSettings,
      });
    }
    if (mayPauseRecording) {
      actions.push({
        id: 'pauseRecording',
        label: intl.formatMessage(intlMessages.pauseRecording),
        onClick: () => {
          setRecordingStatus({ variables: { recording: false } });
        },
      });
    }
    let message = intl.formatMessage(intlMessages.startMessage);
    if (silence.kind === 'silence') {
      message = maxSilenceMinutes === 1
        ? intl.formatMessage(intlMessages.silenceMessageSingular)
        : intl.formatMessage(intlMessages.silenceMessagePlural, { minutes: maxSilenceMinutes });
    }
    fire({
      presentation: 'toast',
      icon: 'record',
      message,
      actions,
    });
  }, [silence, fire, clear]);
};

export default useRecordingWithNoSpeechRule;
