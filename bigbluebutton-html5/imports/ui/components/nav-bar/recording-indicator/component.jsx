import React from 'react';
import Button from '/imports/ui/components/button/component';
import RecordingContainer from '/imports/ui/components/recording/container';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  notificationRecordingStart: {
    id: 'app.notification.recordingStart',
    description: 'Notification for when the recording starts',
  },
  notificationRecordingStop: {
    id: 'app.notification.recordingStop',
    description: 'Notification for when the recording stops',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  amIModerator: PropTypes.bool,
  record: PropTypes.bool,
  recording: PropTypes.bool,
  title: PropTypes.string,
  buttonTitle: PropTypes.string.isRequired,
  mountModal: PropTypes.func.isRequired,
  time: PropTypes.number,
};

const defaultProps = {
  amIModerator: false,
  record: false,
  recording: false,
  title: '',
  time: 0,
};

class RecordingIndicator extends React.PureComponent {
  render() {
    const {
      record,
      title,
      recording,
      buttonTitle,
      mountModal,
      time,
      amIModerator,
      intl,
    } = this.props;

    if (!record) return null;

    return (
      <div>
        {amIModerator ? (
          <div
            aria-label={title}
            className={styles.recordState}
          >

            <div className={styles.border}>
              <Button
                label={buttonTitle}
                hideLabel
                ghost
                className={cx(styles.btn, recording ? styles.recordIndicator : styles.notRecording)}
                onClick={() => {
                  mountModal(<RecordingContainer amIModerator={amIModerator} />);
                  document.activeElement.blur();
                }}
              />
            </div>

            <div className={styles.presentationTitle}>
              {recording ? humanizeSeconds(time) : <div>{buttonTitle}</div>}
            </div>

          </div>
        ) : null }

        {amIModerator ? null : (
          <div
            aria-label={title}
            className={styles.recordState}
          >
            <div className={styles.border}>
              <Button
                label={`${intl.formatMessage(recording
                  ? intlMessages.notificationRecordingStart
                  : intlMessages.notificationRecordingStop)}`}
                aria-label={`${intl.formatMessage(recording
                  ? intlMessages.notificationRecordingStart
                  : intlMessages.notificationRecordingStop)}`}
                hideLabel
                ghost
                className={cx(styles.btn, recording ? styles.recordIndicator : styles.notRecording)}
                onClick={() => {}}
              />
            </div>
            <div className={styles.presentationTitle}>
              {recording ? humanizeSeconds(time) : null}
            </div>
          </div>
        )}
      </div>
    );
  }
}

RecordingIndicator.propTypes = propTypes;
RecordingIndicator.defaultProps = defaultProps;

export default injectIntl(RecordingIndicator);
