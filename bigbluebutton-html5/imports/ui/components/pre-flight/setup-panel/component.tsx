import React from 'react';
import { defineMessages, useIntl } from 'react-intl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MicIcon from '@mui/icons-material/Mic';
import MicOffIcon from '@mui/icons-material/MicOff';
import MenuItem from '@mui/material/MenuItem';
import ProfileStyled from '/imports/ui/components/profile-settings/styles';
import Styled from '../styles';
import AudioSelectors from './audio-selectors/component';
import CameraSetup from './camera-setup/component';
import { AUDIO_MODES, usePreFlight } from '../context';
import { getAudioModeAvailability } from '../audio-options';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import getFromUserSettings from '/imports/ui/services/users-settings';

const intlMessages = defineMessages({
  username: {
    id: 'app.profileSettings.usernameTitle',
    description: 'Label for the username title',
  },
  audioModeLabel: {
    id: 'app.preFlight.audioModeLabel',
    description: 'Label for the audio mode selector',
  },
  microphoneOption: {
    id: 'app.audioModal.microphoneLabel',
    description: 'Join with microphone option',
  },
  listenOnlyOption: {
    id: 'app.audioModal.listenOnlyLabel',
    description: 'Join as listen only option',
  },
  muteLabel: {
    id: 'app.actionsBar.muteLabel',
    description: 'Mute microphone label',
  },
  unmuteLabel: {
    id: 'app.actionsBar.unmuteLabel',
    description: 'Unmute microphone label',
  },
});

/**
 * Replica of the profile settings panel, without the parts that only exist once
 * the user is in the meeting (presence status, camera sharing, extra cameras).
 */
const SetupPanel: React.FC = () => {
  const { formatMessage } = useIntl();
  const {
    audioMode,
    setAudioMode,
    joinMuted,
    setJoinMuted,
  } = usePreFlight();

  const { data: currentUserData } = useCurrentUser((user) => ({
    name: user.name,
    isModerator: user.isModerator,
  }));
  const { canUseMicrophone, canListenOnly } = getAudioModeAvailability(!!currentUserData?.isModerator);
  const isListenOnly = audioMode === AUDIO_MODES.LISTEN_ONLY;

  const KURENTO_CONFIG = window.meetingClientSettings.public.kurento;
  const enableVideo = !!getFromUserSettings('bbb_enable_video', KURENTO_CONFIG.enableVideo);

  const micControl = (
    <Styled.PreviewControlButton
      $active={!joinMuted && !isListenOnly}
      disabled={isListenOnly}
      onClick={() => setJoinMuted(!joinMuted)}
      aria-label={formatMessage(joinMuted ? intlMessages.unmuteLabel : intlMessages.muteLabel)}
      data-test="preFlightMuteToggle"
    >
      {joinMuted || isListenOnly ? <MicOffIcon /> : <MicIcon />}
    </Styled.PreviewControlButton>
  );

  const renderAudioModeSelector = () => {
    if (!canUseMicrophone || !canListenOnly) return null;

    return (
      <Styled.AudioModeContainer>
        <Styled.AudioModeLabel id="pre-flight-audio-mode-label">
          {formatMessage(intlMessages.audioModeLabel)}
        </Styled.AudioModeLabel>
        <ProfileStyled.DeviceSelector
          labelId="pre-flight-audio-mode-label"
          value={audioMode}
          IconComponent={ExpandMoreIcon}
          onChange={(event) => setAudioMode(event.target.value as typeof audioMode)}
          data-test="preFlightAudioMode"
        >
          <MenuItem value={AUDIO_MODES.MICROPHONE}>
            {formatMessage(intlMessages.microphoneOption)}
          </MenuItem>
          <MenuItem value={AUDIO_MODES.LISTEN_ONLY}>
            {formatMessage(intlMessages.listenOnlyOption)}
          </MenuItem>
        </ProfileStyled.DeviceSelector>
      </Styled.AudioModeContainer>
    );
  };

  const commonSections = (
    <>
      <ProfileStyled.UsernameContainer>
        <ProfileStyled.UsernameTitle>{formatMessage(intlMessages.username)}</ProfileStyled.UsernameTitle>
        <ProfileStyled.Username>{currentUserData?.name ?? ''}</ProfileStyled.Username>
      </ProfileStyled.UsernameContainer>
      <ProfileStyled.Separator />
      {renderAudioModeSelector()}
      <ProfileStyled.DevicesSettingsContainer>
        <AudioSelectors listenOnly={isListenOnly} />
      </ProfileStyled.DevicesSettingsContainer>
    </>
  );

  return (
    <ProfileStyled.RootContainer>
      <ProfileStyled.Separator />
      {enableVideo
        ? (
          <CameraSetup micControl={micControl}>
            {commonSections}
          </CameraSetup>
        )
        : (
          <>
            <Styled.PreviewControlsRow>
              {micControl}
            </Styled.PreviewControlsRow>
            <ProfileStyled.ProfileSettings>
              {commonSections}
            </ProfileStyled.ProfileSettings>
          </>
        )}
    </ProfileStyled.RootContainer>
  );
};

export default SetupPanel;
