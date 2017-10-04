import React, { Component } from 'react';
import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles';
import AudioSettings from '../audio-settings/component';
import EchoTest from '../echo-test/component';

const intlMessages = defineMessages({
  backLabel: {
    id: 'app.audio.backLabel',
    description: 'audio settings back button label',
  },
  titleLabel: {
    id: 'app.audio.audioSettings.titleLabel',
    description: 'audio setting title label',
  },
  descriptionLabel: {
    id: 'app.audio.audioSettings.descriptionLabel',
    description: 'audio settings description label',
  },
  micSourceLabel: {
    id: 'app.audio.audioSettings.microphoneSourceLabel',
    description: 'Label for mic source',
  },
  speakerSourceLabel: {
    id: 'app.audio.audioSettings.speakerSourceLabel',
    description: 'Label for speaker source',
  },
  streamVolumeLabel: {
    id: 'app.audio.audioSettings.microphoneStreamLabel',
    description: 'Label for stream volume',
  },

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
});

class AudioModal extends Component {
  constructor(props) {
    super(props);

    this.state = {
      content: null,
    };

    const {
      isConnecting,
      isConnected,
      isEchoTest,
      inputDeviceId,
    } = this.props;

    this.handleGoToAudioOptions = this.handleGoToAudioOptions.bind(this);
    this.handleGoToAudioSettings = this.handleGoToAudioSettings.bind(this);
    this.handleGoToEchoTest = this.handleGoToEchoTest.bind(this);
    this.closeModal = props.closeModal.bind(this);
    this.handleJoinMicrophone = props.joinMicrophone;
    this.handleJoinListenOnly = props.joinListenOnly;
    this.joinEchoTest = props.joinEchoTest;
    this.exitAudio = props.exitAudio;
    this.leaveEchoTest = props.leaveEchoTest;
    this.changeInputDevice = props.changeInputDevice;

    this.contents = {
      echoTest: () => this.renderEchoTest(),
      settings: () => this.renderAudioSettings(),
    };
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
    })
  }

  handleGoToEchoTest() {
    this.joinEchoTest().then(() => {
      this.setState({
        content: 'echoTest',
      });
    })
  }

  componentWillUnmount() {
    const {
      isConnected,
      isEchoTest,
    } = this.props;

    if (isEchoTest) {
      this.exitAudio();
    }
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

  render() {
    const {
      intl,
      isConnecting,
    } = this.props;

    return (
      <ModalBase
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={this.closeModal}>
          { isConnecting ? null :
            <header className={styles.header}>
              <h3 className={styles.title}>{intl.formatMessage(intlMessages.audioChoiceLabel)}</h3>
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

  renderContent() {
    const {
      isConnecting,
      isEchoTest,
    } = this.props;

    const {
      content,
    } = this.state;

    if (isConnecting) {
      return (
        <span className={styles.connecting}>Connecting</span>
      )
    }
    return content ? this.contents[content]() : this.renderAudioOptions();
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
        handleYes={this.handleJoinMicrophone}/>
    );
  }

  renderAudioSettings () {
    const {
      isConnecting,
      isConnected,
      isEchoTest,
      inputDeviceId
    } = this.props;

    return (
      <AudioSettings
        handleBack={this.handleGoToAudioOptions}
        handleRetry={this.handleGoToEchoTest}
        joinEchoTest={this.joinEchoTest}
        exitAudio={this.exitAudio}
        changeInputDevice={this.changeInputDevice}
        isConnecting={isConnecting}
        isConnected={isConnected}
        isEchoTest={isEchoTest}
        inputDeviceId={inputDeviceId}
      />
    )
  }
}

export default injectIntl(AudioModal);
