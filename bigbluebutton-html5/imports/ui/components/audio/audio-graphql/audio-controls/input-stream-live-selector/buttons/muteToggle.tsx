import React, { useEffect, useRef, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from '../styles';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import useToggleVoice from '../../../hooks/useToggleVoice';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/user-actions/mutations';
import VideoService from '/imports/ui/components/video-provider/service';
import {
  startPushToTalk,
  stopPushToTalk,
} from '../service';
import {
  muteAway,
  muteLoadingState,
  useIsMuteLoading,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';

const intlMessages = defineMessages({
  muteAudio: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute audio button label',
  },
  unmuteAudio: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute audio button label',
  },
  umuteAudioAndSetActive: {
    id: 'app.actionsBar.unmuteAndSetActiveLabel',
    description: 'unmute audio button label when user is away',
  },
});

interface MuteToggleProps {
  talking: boolean;
  muted: boolean;
  disabled: boolean;
  isAudioLocked: boolean;
  toggleMuteMicrophone: (muted: boolean, toggleVoice: (userId: string, muted: boolean) => void) => void;
  away: boolean;
  noInputDevice?: boolean;
  openAudioSettings: (props?: { unmuteOnExit?: boolean }) => void;
}

export const MuteToggle: React.FC<MuteToggleProps> = ({
  talking,
  muted,
  disabled,
  isAudioLocked,
  toggleMuteMicrophone,
  away,
  noInputDevice = false,
  openAudioSettings,
}) => {
  const intl = useIntl();
  const toggleMuteShourtcut = useShortcut('toggleMute');
  const toggleVoice = useToggleVoice();
  const [setAway] = useMutation(SET_AWAY);

  const unmuteAudioLabel = away ? intlMessages.umuteAudioAndSetActive : intlMessages.unmuteAudio;
  const label = muted ? intl.formatMessage(unmuteAudioLabel)
    : intl.formatMessage(intlMessages.muteAudio);
  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;
  const isKeyDown = useRef<boolean>(false);
  const cooldownActive = useRef<boolean>(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const COOLDOWN_TIME = 1500;

  const handlePushToTalk = useCallback((action: 'down' | 'up', event: KeyboardEvent) => {
    const activeElement = document.activeElement as HTMLElement | null;
    const isInputField = activeElement
      && (activeElement instanceof HTMLInputElement
        || activeElement instanceof HTMLTextAreaElement
        || activeElement.isContentEditable);
    const Settings = getSettingsSingletonInstance();
    const pushToTalkEnabled = Settings?.application?.pushToTalkEnabled;
    if (
      !pushToTalkEnabled
        || cooldownActive.current
        || event.key !== 'm'
        || event.altKey
        || event.ctrlKey
        || isInputField
    ) return;

    if (action === 'down' && !isKeyDown.current) {
      isKeyDown.current = true;
      startPushToTalk(toggleVoice);
    } else if (action === 'up') {
      isKeyDown.current = false;
      stopPushToTalk(toggleVoice);
      cooldownActive.current = true;
      cooldownTimerRef.current = setTimeout(() => {
        cooldownActive.current = false;
      }, COOLDOWN_TIME);
    }
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => handlePushToTalk('down', event);
    const handleKeyUp = (event: KeyboardEvent) => handlePushToTalk('up', event);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
      }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  React.useEffect(() => {
    muteLoadingState(false);
  }, [muted]);

  const isMuteLoading = useIsMuteLoading();

  const onClickCallback = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (muted) {
      if (away) {
        if (!noInputDevice) muteAway(muted, true, toggleVoice);
        VideoService.setTrackEnabled(true);
        setAway({
          variables: {
            away: false,
          },
        });
      } else if (noInputDevice) {
        // User is in duplex audio, passive-sendrecv, but has no input device set
        // Open the audio settings modal to allow them to select an input device
        openAudioSettings({ unmuteOnExit: true });
      }
    }

    toggleMuteMicrophone(muted, toggleVoice);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-access-key
    <Styled.MuteToggleButton
      onClick={onClickCallback}
      disabled={disabled || isAudioLocked}
      hideLabel
      label={label}
      aria-label={label}
      color={!muted ? 'primary' : 'default'}
      ghost={muted}
      icon={muted ? 'mute' : 'unmute'}
      size="lg"
      circle
      accessKey={toggleMuteShourtcut}
      $talking={talking || undefined}
      animations={animations}
      loading={isMuteLoading}
      data-test={muted ? 'unmuteMicButton' : 'muteMicButton'}
    />
  );
};

export default MuteToggle;
