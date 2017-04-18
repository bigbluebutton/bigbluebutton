import React from 'react';
import styles from '../styles.scss';
import Button from '/imports/ui/components/button/component';
import { withModalMounter } from '/imports/ui/components/modal/service';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';

const intlMessages = defineMessages({
  microphoneLabel: {
    id: 'app.audioModal.microphoneLabel',
  },
  listenOnlyLabel: {
    id: 'app.audioModal.listenOnlyLabel',
  },
  closeLabel: {
    id: 'app.audioModal.closeLabel',
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
    /* TODO: Refactor this to the outer component (audio-modal/container) */
    this.props.mountModal(null);
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
          <FormattedMessage
              id="app.audioModal.audioChoiceLabel"
              description="app.audioModal.audioChoiceDescription"
              defaultMessage="How would you like to join the audio?"
          />
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

export default withModalMounter(injectIntl(JoinAudio));
