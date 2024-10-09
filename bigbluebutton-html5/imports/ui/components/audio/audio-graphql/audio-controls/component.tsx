/* eslint-disable no-underscore-dangle */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import React, { useCallback, useEffect, useMemo } from 'react';
import { User } from '/imports/ui/Types/user';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';
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
}

const AudioControls: React.FC<AudioControlsProps> = ({
  isConnected,
  disabled,
  inAudio,
  isEchoTest,
  updateEchoTestRunning,
  away,
  isConnecting,
}) => {
  const intl = useIntl();
  const joinAudioShortcut = useShortcut('joinAudio');
  const echoTestIntervalRef = React.useRef<ReturnType<typeof setTimeout>>();

  const [isAudioModalOpen, setIsAudioModalOpen] = React.useState(false);
  const [audioModalContent, setAudioModalContent] = React.useState<string | null>(null);
  const [audioModalProps, setAudioModalProps] = React.useState<{ unmuteOnExit?: boolean } | null>(null);

  const handleJoinAudio = useCallback((connected: boolean) => {
    if (connected) {
      joinListenOnly();
    } else {
      setIsAudioModalOpen(true);
    }
  }, []);

  const openAudioSettings = (props: { unmuteOnExit?: boolean } = {}) => {
    setAudioModalContent('settings');
    setAudioModalProps(props);
    setIsAudioModalOpen(true);
  };

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

  return (
    <Styled.Container>
      {!inAudio ? joinButton : <InputStreamLiveSelectorContainer openAudioSettings={openAudioSettings} />}
      {isAudioModalOpen && (
        <AudioModalContainer
          priority="low"
          setIsOpen={() => {
            setIsAudioModalOpen(false);
            setAudioModalContent(null);
            setAudioModalProps(null);
          }}
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

  const { data: currentMeeting } = useMeeting((m: Partial<Meeting>) => ({
    lockSettings: m.lockSettings,
  }));
  const [updateEchoTestRunning] = useMutation(UPDATE_ECHO_TEST_RUNNING);

  // I access the internal variable to get the makevar reference,
  // so we doesn't broke the client that uses the value directly
  // and I can use it to make my component reactive

  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isConnected = useReactiveVar(AudioManager._isConnected.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isConnecting = useReactiveVar(AudioManager._isConnecting.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isHangingUp = useReactiveVar(AudioManager._isHangingUp.value) as boolean;
  // @ts-ignore - temporary while hybrid (meteor+GraphQl)
  const isEchoTest = useReactiveVar(AudioManager._isEchoTest.value) as boolean;

  if (!currentUser || !currentMeeting) return null;

  return (
    <AudioControls
      inAudio={!!currentUser.voice ?? false}
      isConnected={isConnected}
      disabled={isConnecting || isHangingUp}
      isEchoTest={isEchoTest}
      updateEchoTestRunning={updateEchoTestRunning}
      away={currentUser.away || false}
      isConnecting={isConnecting}
    />
  );
};

export default AudioControlsContainer;
