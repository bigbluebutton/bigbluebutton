import React, { Component } from 'react';
import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles';
import AudioSettings from '../audio-settings/component';

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
      settings: false,
    };

    this.handleBack = this.handleBack.bind(this);
    this.handleGoToAudioSettings = this.handleGoToAudioSettings.bind(this);
    this.handleClose = props.closeModal;
    this.handleJoinMicrophone = props.joinMicrophone;
    this.handleJoinListenOnly = props.joinListenOnly;
    this.joinEchoTest = props.joinEchoTest;
    this.exitAudio = props.exitAudio;
  }

  handleBack() {
    this.setState({
      settings: false,
    });
  }

  handleGoToAudioSettings() {
    this.setState({
      settings: true,
    });
  }

  renderAudioOptions() {
    const {
      intl,
    } = this.props;

    return (
      <div className={styles.content}>
        <Button
          className={styles.audioBtn}
          label={intl.formatMessage(intlMessages.microphoneLabel)}
          icon={'unmute'}
          circle
          size={'jumbo'}
          onClick={this.handleGoToAudioSettings}
        />
        <Button
          className={styles.audioBtn}
          label={intl.formatMessage(intlMessages.listenOnlyLabel)}
          icon={'listen'}
          circle
          size={'jumbo'}
          onClick={this.handleJoinListenOnly}
        />
      </div>
    );
  }

  renderAudioSettings() {
    const {
      isConnecting,
      isConnected,
      isEchoTest,
    } = this.props;

    return (
      <AudioSettings
        handleBack={this.handleBack}
        handleJoin={this.handleJoinMicrophone}
        joinEchoTest={this.joinEchoTest}
        exitAudio={this.exitAudio}
        isConnecting={isConnecting}
        isConnected={isConnected}
        isEchoTest={isEchoTest}
      />
    );
  }

  render() {
    const {
      settings,
    } = this.state;

    const {
      intl,
      isConnecting
    } = this.props;

    return (
      <ModalBase overlayClassName={styles.overlay} className={styles.modal}>
        <header className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.audioChoiceLabel)}</h3>
          { !settings ?
            <Button
              className={styles.closeBtn}
              label={intl.formatMessage(intlMessages.closeLabel)}
              icon={'close'}
              size={'md'}
              hideLabel
              onClick={this.handleClose}
            /> : null }
        </header>
        { settings ? this.renderAudioSettings() : this.renderAudioOptions() }
      </ModalBase>
    );
  }
}

export default injectIntl(AudioModal);
