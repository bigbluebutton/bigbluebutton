import React from 'react';
import styles from '../audio-modal/styles.scss';
import Button from '/imports/ui/components/button/component';
import { clearModal } from '/imports/ui/components/app/service';
import { defineMessages, injectIntl } from 'react-intl';

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
});

class JoinAudio extends React.Component {
  constructor(props) {
    super(props);

    this.handleClose = this.handleClose.bind(this);
    this.openAudio = this.openAudio.bind(this);
    this.openListen = this.openListen.bind(this);
  }

  handleClose() {
    this.setState({ isOpen: false });
    clearModal();
  }

  openAudio() {
    this.props.changeMenu(this.props.AUDIO_SETTINGS);
  }

  openListen() {
    this.handleClose();
    this.props.handleJoinListenOnly();
  }

  render() {
    const { intl } = this.props;
    return (
      <div>
        <div className={styles.closeBtn}>
          <Button className={styles.closeBtn}
            label={intl.formatMessage(intlMessages.closeLabel)}
            icon={'close'}
            size={'lg'}
            hideLabel={true}
            onClick={this.handleClose}
          />
        </div>

        <div className={styles.title}>
          {intl.formatMessage(intlMessages.audioChoiceLabel)}
        </div>
        <div className={styles.center}>
          <Button className={styles.audioBtn}
            label={intl.formatMessage(intlMessages.microphoneLabel)}
            icon={'unmute'}
            circle={true}
            size={'jumbo'}
            onClick={this.openAudio}
          />

          <span className={styles.verticalLine}>
          </span>
          <Button className={styles.audioBtn}
            label={intl.formatMessage(intlMessages.listenOnlyLabel)}
            icon={'listen'}
            circle={true}
            size={'jumbo'}
            onClick={this.openListen}
          />
        </div>
      </div>
    );
  }
};

export default injectIntl(JoinAudio);
