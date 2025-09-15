/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useMemo } from 'react';
import { User } from '/imports/ui/Types/user';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import { useMutation, useReactiveVar } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import AudioModalContainer from '../../audio-modal/container';
import AudioManager from '/imports/ui/services/audio-manager';
import { joinListenOnly } from './service';
import Styled from './styles';
import InputStreamLiveSelectorContainer from './input-stream-live-selector/component';
import { UPDATE_ECHO_TEST_RUNNING } from './queries';
import { SET_LISTEN_ONLY_INPUT_DEVICE } from '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/user-actions/mutations';
import connectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';
import useIsAudioConnected from '/imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected';

const intlMessages = defineMessages({
  joinAudio: {
    id: 'app.audio.joinAudio',
    description: 'Join audio button label',
  },
  joinAudioAndSetActive: {
    id: 'app.audio.joinAudioAndSetActive',
    description: 'Join audio button label when user is away',
  },
  leaveAudio: {
    id: 'app.audio.leaveAudio',
    description: 'Leave audio button label',
  },
  muteAudio: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteAudio: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
});

interface AudioControlsProps {
  inAudio: boolean;
  isConnected: boolean;
  disabled: boolean;
  isEchoTest: boolean;
  updateEchoTestRunning: () => void;
  away: boolean;
  isConnecting?: boolean;
  audioInputDevice: string | null;
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isConnected,
  disabled,
  inAudio,
  isEchoTest,
  updateEchoTestRunning,
  away,
  isConnecting,
  audioInputDevice,
}) => {
  const intl = useIntl();
  const joinAudioShortcut = useShortcut('joinAudio');
  const echoTestIntervalRef = React.useRef<ReturnType<typeof setTimeout>>();

  const [isAudioModalOpen, setIsAudioModalOpen] = React.useState(false);
  const [audioModalContent, setAudioModalContent] = React.useState<string | null>(null);
  const [audioModalProps, setAudioModalProps] = React.useState<{ unmuteOnExit?: boolean } | null>(null);

  const [setListenOnlyInputDevice] = useMutation(SET_LISTEN_ONLY_INPUT_DEVICE);

  const handleJoinAudio = useCallback((connected: boolean) => {
    if (connected) {
      joinListenOnly();
    } else {
      setIsAudioModalOpen(true);
    }
  }, []);

  const openAudioSettings = useCallback((props: { unmuteOnExit?: boolean } = {}) => {
    setAudioModalContent('settings');
    setAudioModalProps(props);
    setIsAudioModalOpen(true);
  }, []);

  const joinButton = useMemo(() => {
    const joinAudioLabel = away ? intlMessages.joinAudioAndSetActive : intlMessages.joinAudio;

    return (
      // eslint-disable-next-line jsx-a11y/no-access-key
      <Button
        onClick={() => handleJoinAudio(isConnected)}
        disabled={disabled}
        hideLabel
        aria-label={intl.formatMessage(joinAudioLabel)}
        label={intl.formatMessage(joinAudioLabel)}
        data-test="joinAudio"
        color="default"
        icon="no_audio"
        size="lg"
        circle
        accessKey={joinAudioShortcut}
        loading={isConnecting}
      />
    );
  }, [isConnected, disabled, joinAudioShortcut, away, intl.locale]);

  useEffect(() => {
    if (isEchoTest) {
      echoTestIntervalRef.current = setInterval(() => {
        updateEchoTestRunning();
      }, 1000);
    } else {
      clearInterval(echoTestIntervalRef.current);
    }
  }, [isEchoTest]);

  useEffect(() => {
    if (isConnected && audioInputDevice && audioInputDevice !== '') {
      const listenOnlyInputDevice = audioInputDevice === 'listen-only';
      setListenOnlyInputDevice({
        variables: {
          listenOnlyInputDevice,
        },
      });
    }
  }, [isConnected, audioInputDevice]);

  const setIsOpen = useCallback(() => {
    setIsAudioModalOpen(false);
    setAudioModalContent(null);
    setAudioModalProps(null);
  }, []);

  return (
    <Styled.Container>
      {!inAudio ? joinButton : <InputStreamLiveSelectorContainer openAudioSettings={openAudioSettings} />}
      {isAudioModalOpen && (
        <AudioModalContainer
          priority="low"
          setIsOpen={setIsOpen}
          isOpen={isAudioModalOpen}
          content={audioModalContent}
          unmuteOnExit={audioModalProps?.unmuteOnExit}
        />
      )}
    </Styled.Container>
  );
};

export const AudioControlsContainer: React.FC = () => {
  const { data: currentUser } = useCurrentUser((u: Partial<User>) => ({
    presenter: u.presenter,
    isModerator: u.isModerator,
    locked: u?.locked ?? false,
    voice: u.voice,
    away: u.away,
  }));

  const [updateEchoTestRunningMutation] = useMutation(UPDATE_ECHO_TEST_RUNNING);

  const updateEchoTestRunning = useCallback(() => {
    updateEchoTestRunningMutation();
  }, []);

  // I access the internal variable to get the makevar reference,
  // so we doesn't broke the client that uses the value directly
  // and I can use it to make my component reactive

  const isConnected = useIsAudioConnected();
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isDeafened = useReactiveVar(AudioManager._isDeafened.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isConnecting = useReactiveVar(AudioManager._isConnecting.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isHangingUp = useReactiveVar(AudioManager._isHangingUp.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isEchoTest = useReactiveVar(AudioManager._isEchoTest.value) as boolean;
  // @ts-ignore
  const audioInputDevice = useReactiveVar(AudioManager._inputDeviceId.value);

  const isClientConnected = useReactiveVar(connectionStatus.getConnectedStatusVar());

  if (!currentUser) return null;

  return (
    <AudioControls
      inAudio={(!!currentUser.voice && !isDeafened)}
      isConnected={isConnected}
      disabled={(isConnecting || isHangingUp || !isClientConnected)}
      isEchoTest={isEchoTest}
      updateEchoTestRunning={updateEchoTestRunning}
      away={currentUser.away ?? false}
      isConnecting={isConnecting}
      audioInputDevice={audioInputDevice}
    />
  );
};

export default AudioControlsContainer;
