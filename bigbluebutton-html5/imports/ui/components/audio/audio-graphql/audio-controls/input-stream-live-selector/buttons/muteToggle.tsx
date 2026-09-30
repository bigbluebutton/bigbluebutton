import React, { useEffect, useRef, useCallback } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import KEYS from '/imports/utils/keys';
import deviceInfo from '/imports/utils/deviceInfo';
import Styled from '../styles';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import useMuteSoundAlert from '/imports/ui/core/hooks/useMuteSoundAlert';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import useToggleVoice from '../../../hooks/useToggleVoice';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-participants/list-item/mutations';
import VideoService from '/imports/ui/components/video-provider/service';
import {
  startPushToTalk,
  stopPushToTalk,
  isMutedAlertEnabled,
} from '../service';
import {
  muteAway,
  muteLoadingState,
  useIsMuteLoading,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import { listItemBgHover } from '/imports/ui/stylesheets/styled-components/palette';
import MutedAlert from '/imports/ui/components/muted-alert/component';

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

export interface MuteToggleProps {
  talking: boolean;
  muted: boolean;
  disabled: boolean;
  mediaInterrupted: boolean;
  isAudioLocked: boolean;
  toggleMuteMicrophone: (muted: boolean, toggleVoice: (userId: string, muted: boolean) => void) => void;
  away: boolean;
  noInputDevice?: boolean;
  openAudioSettings: (props?: { unmuteOnExit?: boolean }) => void;
  showMutedAlert: boolean;
  inputStream: string;
  isModerator: boolean;
  isPresenter: boolean;
}

export const MuteToggle: React.FC<MuteToggleProps> = ({
  talking,
  muted,
  disabled,
  mediaInterrupted,
  isAudioLocked,
  toggleMuteMicrophone,
  away,
  noInputDevice = false,
  openAudioSettings,
  showMutedAlert,
  inputStream,
  isModerator,
  isPresenter,
}) => {
  useMuteSoundAlert();

  const intl = useIntl();
  const toggleMuteShourtcut = useShortcut('toggleMute');
  const toggleVoice = useToggleVoice();
  const [setAway] = useMutation(SET_AWAY);
  const MUTED_ALERT_ENABLED = isMutedAlertEnabled();

  const unmuteAudioLabel = away ? intlMessages.umuteAudioAndSetActive : intlMessages.unmuteAudio;
  const label = muted ? intl.formatMessage(unmuteAudioLabel)
    : intl.formatMessage(intlMessages.muteAudio);
  const Settings = getSettingsSingletonInstance();
  const animations = Settings?.application?.animations;
  const isKeyDown = useRef<boolean>(false);
  const cooldownActive = useRef<boolean>(false);
  const cooldownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const COOLDOWN_TIME = 800;

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
        || event.key !== KEYS.m
        || event.altKey
        || event.ctrlKey
        || isInputField
    ) return;

    if (action === 'down' && !isKeyDown.current) {
      // Only unmuting the mic is refused while the media session is down as it is
      // a no-op that may create an inconsistent state.
      // Muting should still go through as it is partially effective locally.
      if (mediaInterrupted) return;

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
    setTimeout(() => {
      muteLoadingState(false);
    }, 1000);
  }, [mediaInterrupted]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => handlePushToTalk('down', event);
    const handleKeyUp = (event: KeyboardEvent) => handlePushToTalk('up', event);

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      if (cooldownTimerRef.current) {
        clearTimeout(cooldownTimerRef.current);
        cooldownTimerRef.current = null;
        cooldownActive.current = false;
      }
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [handlePushToTalk]);

  useEffect(() => {
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
    <Styled.RelativePositioningContainer>
      {showMutedAlert && MUTED_ALERT_ENABLED ? (
        <div data-debug="live-watcher" aria-live="polite">
          <MutedAlert
            {...{
              muted, inputStream, isPresenter,
            }}
            isViewer={!isModerator}
          />
        </div>
      ) : null}
      {/* eslint-disable-next-line jsx-a11y/no-access-key */}
      <Styled.MuteToggleButton
        onClick={onClickCallback}
        disabled={disabled || isAudioLocked || (mediaInterrupted && muted)}
        hideLabel
        label={label}
        aria-label={label}
        color={!muted && !mediaInterrupted ? 'primary' : 'default'}
        icon={muted ? 'mute' : 'unmute'}
        size={deviceInfo.isMobile ? 'md' : 'lg'}
        circle
        accessKey={toggleMuteShourtcut}
        $talking={(talking && !mediaInterrupted) || undefined}
        animations={animations}
        loading={isMuteLoading}
        data-test={muted ? 'unmuteMicButton' : 'muteMicButton'}
        hoverColor={listItemBgHover}
      />
    </Styled.RelativePositioningContainer>
  );
};

export default MuteToggle;
