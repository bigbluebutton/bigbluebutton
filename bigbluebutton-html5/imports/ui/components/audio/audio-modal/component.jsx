import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import styles from './styles';
import AudioSettings from '../audio-settings/component';
import EchoTest from '../echo-test/component';

const propTypes = {
  intl: intlShape.isRequired,
  closeModal: PropTypes.func.isRequired,
  joinMicrophone: PropTypes.func.isRequired,
  joinListenOnly: PropTypes.func.isRequired,
  joinEchoTest: PropTypes.func.isRequired,
  exitAudio: PropTypes.func.isRequired,
  leaveEchoTest: PropTypes.func.isRequired,
  changeInputDevice: PropTypes.func.isRequired,
  changeOutputDevice: PropTypes.func.isRequired,
  isEchoTest: PropTypes.bool.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  isConnected: PropTypes.bool.isRequired,
  inputDeviceId: PropTypes.string.isRequired,
  outputDeviceId: PropTypes.string.isRequired,
};

const intlMessages = defineMessages({
  microphoneLabel: {
    id: 'app.audioModal.microphoneLabel',
    description: 'Join mic audio button label',
  },
  listenOnlyLabel: {
    id: 'app.audioModal.listenOnlyLabel',
    description: 'Join listen only audio button label',
  },
  closeLabel: {
    id: 'app.audioModal.closeLabel',
    description: 'close audio modal button label',
  },
  audioChoiceLabel: {
    id: 'app.audioModal.audioChoiceLabel',
    description: 'Join audio modal title',
  },
  echoTestTitle: {
    id: 'app.audioModal.echoTestTitle',
    description: 'Title for the echo test',
  },
  settingsTitle: {
    id: 'app.audioModal.settingsTitle',
    description: 'Title for the audio modal',
  },
  connecting: {
    id: 'app.audioModal.connecting',
    description: 'Message for audio connecting',
  },
  connectingEchoTest: {
    id: 'app.audioModal.connectingEchoTest',
    description: 'Message for echo test connecting',
  },
});

class AudioModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: null,
    };

    const {
      intl,
      closeModal,
      joinMicrophone,
      joinListenOnly,
      joinEchoTest,
      exitAudio,
      leaveEchoTest,
      changeInputDevice,
      changeOutputDevice,
    } = props;

    this.handleGoToAudioOptions = this.handleGoToAudioOptions.bind(this);
    this.handleGoToAudioSettings = this.handleGoToAudioSettings.bind(this);
    this.handleGoToEchoTest = this.handleGoToEchoTest.bind(this);
    this.closeModal = closeModal;
    this.handleJoinMicrophone = joinMicrophone;
    this.handleJoinListenOnly = joinListenOnly;
    this.joinEchoTest = joinEchoTest;
    this.exitAudio = exitAudio;
    this.leaveEchoTest = leaveEchoTest;
    this.changeInputDevice = changeInputDevice;
    this.changeOutputDevice = changeOutputDevice;

    this.contents = {
      echoTest: {
        title: intl.formatMessage(intlMessages.echoTestTitle),
        component: () => this.renderEchoTest(),
      },
      settings: {
        title: intl.formatMessage(intlMessages.settingsTitle),
        component: () => this.renderAudioSettings(),
      },
    };
  }

  componentWillUnmount() {
    const {
      isEchoTest,
    } = this.props;

    if (isEchoTest) {
      this.exitAudio();
    }
  }

  handleGoToAudioOptions() {
    this.setState({
      content: null,
    });
  }

  handleGoToAudioSettings() {
    this.leaveEchoTest().then(() => {
      this.setState({
        content: 'settings',
      });
    });
  }

  handleGoToEchoTest() {
    this.joinEchoTest().then(() => {
      this.setState({
        content: 'echoTest',
      });
    });
  }

  renderAudioOptions() {
    const {
      intl,
    } = this.props;

    return (
      <span>
        <Button
          className={styles.audioBtn}
          label={intl.formatMessage(intlMessages.microphoneLabel)}
          icon={'unmute'}
          circle
          size={'jumbo'}
          onClick={this.handleGoToEchoTest}
        />
        <Button
          className={styles.audioBtn}
          label={intl.formatMessage(intlMessages.listenOnlyLabel)}
          icon={'listen'}
          circle
          size={'jumbo'}
          onClick={this.handleJoinListenOnly}
        />
      </span>
    );
  }

  renderContent() {
    const {
      isConnecting,
      isEchoTest,
      intl,
    } = this.props;

    const {
      content,
    } = this.state;

    if (isConnecting) {
      return (
        <span className={styles.connecting}>
          { isEchoTest ?
            intl.formatMessage(intlMessages.connecting) :
            intl.formatMessage(intlMessages.connectingEcho)
          }
        </span>
      );
    }
    return content ? this.contents[content].component() : this.renderAudioOptions();
  }

  renderEchoTest() {
    const {
      isConnecting,
    } = this.props;

    return (
      <EchoTest
        isConnecting={isConnecting}
        joinEchoTest={this.joinEchoTest}
        leaveEchoTest={this.leaveEchoTest}
        handleNo={this.handleGoToAudioSettings}
        handleYes={this.handleJoinMicrophone}
      />
    );
  }

  renderAudioSettings() {
    const {
      isConnecting,
      isConnected,
      isEchoTest,
      inputDeviceId,
      outputDeviceId,
    } = this.props;

    return (
      <AudioSettings
        handleBack={this.handleGoToAudioOptions}
        handleRetry={this.handleGoToEchoTest}
        joinEchoTest={this.joinEchoTest}
        exitAudio={this.exitAudio}
        changeInputDevice={this.changeInputDevice}
        changeOutputDevice={this.changeOutputDevice}
        isConnecting={isConnecting}
        isConnected={isConnected}
        isEchoTest={isEchoTest}
        inputDeviceId={inputDeviceId}
        outputDeviceId={outputDeviceId}
      />
    );
  }

  render() {
    const {
      intl,
      isConnecting,
    } = this.props;

    const {
      content,
    } = this.state;

    return (
      <ModalBase
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={this.closeModal}
      >
        { isConnecting ? null :
        <header className={styles.header}>
          <h3 className={styles.title}>
            { content ?
              this.contents[content].title :
              intl.formatMessage(intlMessages.audioChoiceLabel)}
          </h3>
          <Button
            className={styles.closeBtn}
            label={intl.formatMessage(intlMessages.closeLabel)}
            icon={'close'}
            size={'md'}
            hideLabel
            onClick={this.closeModal}
          />
        </header>
        }
        <div className={styles.content}>
          { this.renderContent() }
        </div>
      </ModalBase>
    );
  }
}

AudioModal.propTypes = propTypes;

export default injectIntl(AudioModal);
