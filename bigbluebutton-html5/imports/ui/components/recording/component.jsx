import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
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

const propTypes = {
  intl: intlShape.isRequired,
  closeModal: PropTypes.func.isRequired,
  toggleRecording: PropTypes.func.isRequired,
  recordingStatus: PropTypes.bool,
  amIModerator: PropTypes.bool,
};

const defaultProps = {
  recordingStatus: false,
  amIModerator: false,
};

class RecordingComponent extends React.PureComponent {
  render() {
    const {
      intl,
      recordingStatus,
      amIModerator,
      closeModal,
      toggleRecording,
    } = this.props;

    if (!amIModerator) return null;
    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={closeModal}
        hideBorder
      >
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>
              {
                intl.formatMessage(!recordingStatus
                  ? intlMessages.startTitle
                  : intlMessages.stopTitle)
              }
            </div>
          </div>
          <div className={styles.description}>
            {`${intl.formatMessage(!recordingStatus
              ? intlMessages.startDescription
              : intlMessages.stopDescription)}`}
          </div>
          <div className={styles.footer}>
            <Button
              color="primary"
              className={styles.button}
              label={intl.formatMessage(intlMessages.yesLabel)}
              onClick={toggleRecording}
            />
            <Button
              label={intl.formatMessage(intlMessages.noLabel)}
              className={styles.button}
              onClick={closeModal}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

RecordingComponent.propTypes = propTypes;
RecordingComponent.defaultProps = defaultProps;

export default injectIntl(RecordingComponent);
