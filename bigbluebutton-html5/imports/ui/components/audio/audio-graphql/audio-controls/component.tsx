import React, { useCallback, useEffect, useMemo } from 'react';
import { User } from '/imports/ui/Types/user';
import { useCurrentUser } from '/imports/ui/core/hooks/useCurrentUser';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import { Meeting } from '/imports/ui/Types/meeting';
import { useShortcutHelp } from '/imports/ui/core/hooks/useShortcutHelp';
import { useMutation, useReactiveVar } from '@apollo/client';
import { defineMessages, useIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import AudioModalContainer from '../../audio-modal/container';
import AudioManager from '/imports/ui/services/audio-manager';
import { joinListenOnly } from './service';
import Styled from './styles';
import InputStreamLiveSelectorContainer from './input-stream-live-selector/component';
import deviceInfo from '/imports/utils/deviceInfo';
import { UPDATE_ECHO_TEST_RUNNING } from './queries';

const intlMessages = defineMessages({
  joinAudio: {
    id: 'app.audio.joinAudio',
    description: 'Join audio button label',
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
  updateEchoTestRunning: Function,
};

const AudioControls: React.FC<AudioControlsProps> = ({
  isConnected,
  disabled,
  inAudio,
  isEchoTest,
  updateEchoTestRunning,
}) => {
  const intl = useIntl();
  const joinAudioShourtcut = useShortcutHelp('joinaudio');
  const echoTestIntervalRef = React.useRef<number>();

  const [isAudioModalOpen, setIsAudioModalOpen] = React.useState(false);

  const handleJoinAudio = useCallback((isConnected: boolean) => {
    if (isConnected) {
      joinListenOnly();
    } else {
      setIsAudioModalOpen(true);
    }
  }, [])

  const joinButton = useMemo(() => {
    return (
      <Button
        onClick={() => handleJoinAudio(isConnected)}
        disabled={disabled}
        hideLabel
        aria-label={intl.formatMessage(intlMessages.joinAudio)}
        label={intl.formatMessage(intlMessages.joinAudio)}
        data-test="joinAudio"
        color="default"
        ghost
        icon="no_audio"
        size="lg"
        circle
        accessKey={joinAudioShourtcut}
      />
    )
  }, [isConnected, disabled]);

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
      {!inAudio ? joinButton : <InputStreamLiveSelectorContainer />}
      {
        isAudioModalOpen ? <AudioModalContainer
          {...{
            priority: "low",
            setIsOpen: () => setIsAudioModalOpen(false),
            isOpen: isAudioModalOpen
          }}
        /> : null
      }
    </Styled.Container>
  );
};

export const AudioControlsContainer: React.FC = () => {
  const currentUser: Partial<User> = useCurrentUser((u: Partial<User>) => {
    return {
      presenter: u.presenter,
      isModerator: u.isModerator,
      locked: u?.locked ?? false,
      voice: u.voice
    }
  });

  const currentMeeting: Partial<Meeting> = useMeeting((m: Partial<Meeting>) => {
    return {
      lockSettings: m.lockSettings,
    }
  });
  const [updateEchoTestRunning] = useMutation(UPDATE_ECHO_TEST_RUNNING);

  // I access the internal variable to get the makevar reference, so we doesn't broke the client that uses the value directly
  // and I can use it to make my component reactive
  const isConnected = useReactiveVar(AudioManager._isConnected.value) as boolean;
  const isConnecting = useReactiveVar(AudioManager._isConnecting.value) as boolean;
  const isHangingUp = useReactiveVar(AudioManager._isHangingUp.value) as boolean;
  const isEchoTest = useReactiveVar(AudioManager._isEchoTest.value) as boolean;

  if (!currentUser || !currentMeeting) return null;
  return <AudioControls
    inAudio={!!currentUser.voice ?? false}
    isConnected={isConnected}
    disabled={isConnecting || isHangingUp}
    isEchoTest={isEchoTest}
    updateEchoTestRunning={updateEchoTestRunning}
  />;
};

export default AudioControlsContainer;
