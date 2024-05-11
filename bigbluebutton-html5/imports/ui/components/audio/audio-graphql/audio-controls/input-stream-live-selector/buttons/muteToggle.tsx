import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import Styled from '../styles';
import { useShortcut } from '/imports/ui/core/hooks/useShortcut';
import Settings from '/imports/ui/services/settings';
import useToggleVoice from '../../../hooks/useToggleVoice';
import { SET_AWAY } from '/imports/ui/components/user-list/user-list-content/user-participants/user-list-participants/user-actions/mutations';
import VideoService from '/imports/ui/components/video-provider/video-provider-graphql/service';
import {
  muteAway,
} from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore - temporary while settings are still in .js
const { animations } = Settings.application;

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
  toggleMuteMicrophone: (muted: boolean, toggleVoice: (userId?: string | null, muted?: boolean | null) => void) => void;
  away: boolean;
}

export const MuteToggle: React.FC<MuteToggleProps> = ({
  talking,
  muted,
  disabled,
  isAudioLocked,
  toggleMuteMicrophone,
  away,
}) => {
  const intl = useIntl();
  const toggleMuteShourtcut = useShortcut('toggleMute');
  const toggleVoice = useToggleVoice();
  const [setAway] = useMutation(SET_AWAY);

  const unmuteAudioLabel = away ? intlMessages.umuteAudioAndSetActive : intlMessages.unmuteAudio;
  const label = muted ? intl.formatMessage(unmuteAudioLabel)
    : intl.formatMessage(intlMessages.muteAudio);
  const onClickCallback = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    if (muted) {
      muteAway(muted, true, toggleVoice);
      VideoService.setTrackEnabled(true);
      setAway({
        variables: {
          away: false,
        },
      });
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
      data-test={muted ? 'unmuteMicButton' : 'muteMicButton'}
    />
  );
};

export default MuteToggle;
