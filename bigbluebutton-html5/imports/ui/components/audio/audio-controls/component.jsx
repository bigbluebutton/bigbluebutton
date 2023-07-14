import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import deviceInfo from '/imports/utils/deviceInfo';
import withShortcutHelper from '/imports/ui/components/shortcut-help/service';
import InputStreamLiveSelectorContainer from './input-stream-live-selector/container';
import MutedAlert from '/imports/ui/components/muted-alert/component';
import Styled from './styles';
import Button from '/imports/ui/components/common/button/component';
import AudioModalContainer from '../audio-modal/container';

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

    this.state = {
      isAudioModalOpen: false,
    };

    this.renderButtonsAndStreamSelector = this.renderButtonsAndStreamSelector.bind(this);
    this.renderJoinLeaveButton = this.renderJoinLeaveButton.bind(this);
    this.setAudioModalIsOpen = this.setAudioModalIsOpen.bind(this);
  }

  renderJoinButton() {
    const {
      disable,
      intl,
      shortcuts,
      joinListenOnly,
      isConnected
    } = this.props;

    return (
      <Button
        onClick={() => this.handleJoinAudio(joinListenOnly, isConnected)}
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

  renderButtonsAndStreamSelector(_enableDynamicDeviceSelection) {
    const {
      handleLeaveAudio, handleToggleMuteMicrophone, muted, disable, talking,
    } = this.props;

    const { isMobile } = deviceInfo;

    return (
      <InputStreamLiveSelectorContainer {...{
        handleLeaveAudio,
        handleToggleMuteMicrophone,
        muted,
        disable,
        talking,
        isMobile,
        _enableDynamicDeviceSelection,
      }}
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

    const _enableDynamicDeviceSelection = enableDynamicAudioDeviceSelection && !isMobile;

    if (inAudio) {
      return this.renderButtonsAndStreamSelector(_enableDynamicDeviceSelection);
    }

    return this.renderJoinButton();
  }

  handleJoinAudio(joinListenOnly, isConnected) {
    (isConnected()
    ? joinListenOnly()
    : this.setAudioModalIsOpen(true)
  )}

  setAudioModalIsOpen(value) {
    this.setState({ isAudioModalOpen: value })
  }

  render() {
    const {
      showMute,
      muted,
      isVoiceUser,
      listenOnly,
      inputStream,
      isViewer,
      isPresenter,
    } = this.props;

    const { isAudioModalOpen } = this.state;

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
        {
          this.renderJoinLeaveButton()
        }
        {
          isAudioModalOpen ? <AudioModalContainer 
            {...{
              priority: "low",
              setIsOpen: this.setAudioModalIsOpen,
              isOpen: isAudioModalOpen
            }}
          /> : null
        }
      </Styled.Container>
    );
  }
}

AudioControls.propTypes = propTypes;

export default withShortcutHelper(injectIntl(AudioControls), ['joinAudio',
  'leaveAudio', 'toggleMute']);
