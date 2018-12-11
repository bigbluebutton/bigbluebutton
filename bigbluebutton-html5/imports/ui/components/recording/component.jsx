import React, { Component } from 'react';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import Modal from '/imports/ui/components/modal/simple/component';
import { styles } from './styles';

const intlMessages = defineMessages({
  startTitle: {
    id: 'app.recording.startTitle',
    description: 'start recording title',
  },
  stopTitle: {
    id: 'app.recording.stopTitle',
    description: 'stop recording title',
  },
  startDescription: {
    id: 'app.recording.startDescription',
    description: 'start recording description',
  },
  stopDescription: {
    id: 'app.recording.stopDescription',
    description: 'stop recording description',
  },
  yesLabel: {
    id: 'app.audioModal.yes',
    description: 'label for yes button',
  },
  noLabel: {
    id: 'app.audioModal.no',
    description: 'label for no button',
  },
});

class RecordingComponent extends Component {
  constructor(props) {
    super(props);
    const {
      closeModal,
      toggleRecording,
    } = props;

    this.closeModal = closeModal;
    this.toggleRecording = toggleRecording;
  }

  render() {
    const { intl, meeting } = this.props;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={this.closeModal}
        hideBorder
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>{intl.formatMessage(!meeting.recordProp.recording ?
            intlMessages.startTitle : intlMessages.stopTitle)}
            </div>
          </div>
          <div className={styles.description}>
            {`${intl.formatMessage(!meeting.recordProp.recording ? intlMessages.startDescription :
            intlMessages.stopDescription)}`}
          </div>
          <div className={styles.footer}>
            <Button
              color="primary"
              className={styles.button}
              label={intl.formatMessage(intlMessages.yesLabel)}
              onClick={() => this.toggleRecording()}
            />
            <Button
              label={intl.formatMessage(intlMessages.noLabel)}
              className={styles.button}
              onClick={() => this.closeModal()}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

export default injectIntl(RecordingComponent);
