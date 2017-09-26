import React, { Component } from 'react';
import ModalBase from '/imports/ui/components/modal/base/component';
import Button from '/imports/ui/components/button/component';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles';
import JoinAudio from '../join-audio/component';
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
    this.handleMicrophone = this.handleMicrophone.bind(this);
    this.handleClose = this.handleClose.bind(this);
  }

  handleBack() {
    this.setState({
      settings: false,
    });
  }

  handleMicrophone() {
    this.setState({
      settings: true,
    });
  }

  handleClose() {
    console.log('handleClose');
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
          onClick={this.handleMicrophone}
        />
        <Button
          className={styles.audioBtn}
          label={intl.formatMessage(intlMessages.listenOnlyLabel)}
          icon={'listen'}
          circle
          size={'jumbo'}
          onClick={() => console.log('click listen only')}
        />
      </div>
    );
  }

  renderAudioSettings() {
    return <AudioSettings handleBack={this.handleBack} />;
  }

  render() {
    const {
      settings,
    } = this.state;

    const {
      intl,
    } = this.props;

    return (
      <ModalBase overlayClassName={styles.overlay} className={styles.modal}>
        <header className={styles.header}>
          <h3 className={styles.title}>{intl.formatMessage(intlMessages.audioChoiceLabel)}</h3>
          <Button
            className={styles.closeBtn}
            label={intl.formatMessage(intlMessages.closeLabel)}
            icon={'close'}
            size={'md'}
            hideLabel
            onClick={this.handleClose}
          />
        </header>

      { settings ? this.renderAudioSettings() : this.renderAudioOptions() }
      </ModalBase>
    );
  }
}

export default injectIntl(AudioModal);
