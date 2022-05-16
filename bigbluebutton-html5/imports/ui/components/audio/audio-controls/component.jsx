import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import InputStreamLiveSelectorContainer from './input-stream-live-selector/container';
import MutedAlert from '/imports/ui/components/muted-alert/component';
import Styled from './styles';
import Settings from '/imports/ui/services/settings';

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

const propTypes = {
  shortcuts: PropTypes.objectOf(PropTypes.string).isRequired,
  handleToggleMuteMicrophone: PropTypes.func.isRequired,
  handleJoinAudio: PropTypes.func.isRequired,
  handleLeaveAudio: PropTypes.func.isRequired,
  disable: PropTypes.bool.isRequired,
  muted: PropTypes.bool.isRequired,
  showMute: PropTypes.bool.isRequired,
  inAudio: PropTypes.bool.isRequired,
  listenOnly: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  talking: PropTypes.bool.isRequired,
};

class AudioControls extends PureComponent {
  constructor(props) {
    super(props);
    this.renderLeaveButtonWithoutLiveStreamSelector = this
      .renderLeaveButtonWithoutLiveStreamSelector.bind(this);

    this.renderJoinLeaveButton = this.renderJoinLeaveButton.bind(this);
  }

  renderJoinButton() {
    const {
      handleJoinAudio,
      disable,
      intl,
      shortcuts,
    } = this.props;

    return (
      <Styled.AudioControlsButton
        onClick={handleJoinAudio}
        disabled={disable}
        hideLabel
        aria-label={intl.formatMessage(intlMessages.joinAudio)}
        label={intl.formatMessage(intlMessages.joinAudio)}
        data-test="joinAudio"
        color="default"
        ghost
        icon="no_audio"
        size="lg"
        circle
        accessKey={shortcuts.joinaudio}
      />
    );
  }

  static renderLeaveButtonWithLiveStreamSelector(props) {
    const { handleLeaveAudio, isRTL } = props;
    return (
      <InputStreamLiveSelectorContainer {...{ handleLeaveAudio, isRTL }} />
    );
  }

  renderLeaveButtonWithoutLiveStreamSelector() {
    const {
      handleJoinAudio,
      handleLeaveAudio,
      disable,
      inAudio,
      listenOnly,
      intl,
      shortcuts,
    } = this.props;

    let joinIcon = 'no_audio';
    if (inAudio) {
      if (listenOnly) {
        joinIcon = 'listen';
      } else {
        joinIcon = 'volume_level_2';
      }
    }

    return (
      <Styled.LeaveButtonWithoutLiveStreamSelector
        onClick={inAudio ? handleLeaveAudio : handleJoinAudio}
        disabled={disable}
        data-test={inAudio ? 'leaveAudio' : 'joinAudio'}
        hideLabel
        aria-label={inAudio ? intl.formatMessage(intlMessages.leaveAudio)
          : intl.formatMessage(intlMessages.joinAudio)}
        label={inAudio ? intl.formatMessage(intlMessages.leaveAudio)
          : intl.formatMessage(intlMessages.joinAudio)}
        color={inAudio ? 'primary' : 'default'}
        ghost={!inAudio}
        icon={joinIcon}
        size="lg"
        circle
        accessKey={inAudio ? shortcuts.leaveaudio : shortcuts.joinaudio}
      />
    );
  }

  renderJoinLeaveButton() {
    const {
      inAudio,
    } = this.props;

    const { isMobile } = deviceInfo;

    let { enableDynamicAudioDeviceSelection } = Meteor.settings.public.app;

    if (typeof enableDynamicAudioDeviceSelection === 'undefined') {
      enableDynamicAudioDeviceSelection = true;
    }

    const _enableDynamicDeviceSelection = enableDynamicAudioDeviceSelection
      && !isMobile;

    if (inAudio) {
      if (_enableDynamicDeviceSelection) {
        return AudioControls.renderLeaveButtonWithLiveStreamSelector(this
          .props);
      }

      return this.renderLeaveButtonWithoutLiveStreamSelector();
    }

    return this.renderJoinButton();
  }

  render() {
    const {
      handleToggleMuteMicrophone,
      showMute,
      muted,
      disable,
      talking,
      intl,
      shortcuts,
      isVoiceUser,
      listenOnly,
      inputStream,
      isViewer,
      isPresenter,
    } = this.props;

    const label = muted ? intl.formatMessage(intlMessages.unmuteAudio)
      : intl.formatMessage(intlMessages.muteAudio);

    const { animations } = Settings.application;

    const toggleMuteBtn = (
      <Styled.MuteToggleButton
        onClick={handleToggleMuteMicrophone}
        disabled={disable}
        hideLabel
        label={label}
        aria-label={label}
        color={!muted ? 'primary' : 'default'}
        ghost={muted}
        icon={muted ? 'mute' : 'unmute'}
        size="lg"
        circle
        accessKey={shortcuts.togglemute}
        talking={talking}
        animations={animations}
        data-test="toggleMicrophoneButton"
      />
    );

    const MUTE_ALERT_CONFIG = Meteor.settings.public.app.mutedAlert;
    const { enabled: muteAlertEnabled } = MUTE_ALERT_CONFIG;

    return (
      <Styled.Container>
        {isVoiceUser && inputStream && muteAlertEnabled && !listenOnly && muted && showMute ? (
          <MutedAlert {...{
            muted, inputStream, isViewer, isPresenter,
          }}
          />
        ) : null}
        {showMute && isVoiceUser ? toggleMuteBtn : null}
        {
          this.renderJoinLeaveButton()
        }
      </Styled.Container>
    );
  }
}

AudioControls.propTypes = propTypes;

export default withShortcutHelper(injectIntl(AudioControls), ['joinAudio',
  'leaveAudio', 'toggleMute']);
