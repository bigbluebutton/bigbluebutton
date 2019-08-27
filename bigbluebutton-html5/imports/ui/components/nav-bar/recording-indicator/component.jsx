import React, { PureComponent } from 'react';
import RecordingContainer from '/imports/ui/components/recording/container';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import Tooltip from '/imports/ui/components/tooltip/component';
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
  recordingAriaLabel: {
    id: 'app.notification.recordingAriaLabel',
    description: 'Notification for when the recording stops',
  },
  startTitle: {
    id: 'app.recording.startTitle',
    description: 'start recording title',
  },
  stopTitle: {
    id: 'app.recording.stopTitle',
    description: 'stop recording title',
  },
  resumeTitle: {
    id: 'app.recording.resumeTitle',
    description: 'resume recording title',
  },
});

const propTypes = {
  intl: intlShape.isRequired,
  amIModerator: PropTypes.bool,
  record: PropTypes.bool,
  recording: PropTypes.bool,
  title: PropTypes.string,
  mountModal: PropTypes.func.isRequired,
  time: PropTypes.number,
  allowStartStopRecording: PropTypes.bool.isRequired,
};

const defaultProps = {
  amIModerator: false,
  record: false,
  recording: false,
  title: '',
  time: 0,
};

class RecordingIndicator extends PureComponent {
  render() {
    const {
      record,
      title,
      recording,
      mountModal,
      time,
      amIModerator,
      intl,
      allowStartStopRecording,
    } = this.props;

    if (!record) return null;

    let recordTitle = '';
    if (!recording) {
      recordTitle = time > 0
        ? intl.formatMessage(intlMessages.resumeTitle)
        : intl.formatMessage(intlMessages.startTitle);
    } else {
      recordTitle = intl.formatMessage(intlMessages.stopTitle);
    }

    const recordingToggle = () => {
      mountModal(<RecordingContainer amIModerator={amIModerator} />);
      document.activeElement.blur();
    };

    const recordingIndicatorIcon = (
      <span className={styles.recordingIndicatorIcon}>
        <svg xmlns="http://www.w3.org/2000/svg" height="100%" version="1" viewBox="0 0 20 20">
          <g stroke="#FFF" fill="#FFF" strokeLinecap="square">
            <circle
              fill="none"
              strokeWidth="1"
              r="9"
              cx="10"
              cy="10"
            />
            <circle
              stroke={recording ? '#F00' : '#FFF'}
              fill={recording ? '#F00' : '#FFF'}
              r="4"
              cx="10"
              cy="10"
            />
          </g>
        </svg>
      </span>
    );

    const showButton = amIModerator && allowStartStopRecording;

    const recordMeetingButton = (
      <div
        aria-label={title}
        className={recording ? styles.recordingControlON : styles.recordingControlOFF}
        role="button"
        tabIndex={0}
        key="recording-toggle"
        onClick={recordingToggle}
        onKeyPress={recordingToggle}
      >
        {recordingIndicatorIcon}

        <div className={styles.presentationTitle}>
          {recording
            ? (
              <span className={styles.visuallyHidden}>
                {`${intl.formatMessage(intlMessages.recordingAriaLabel)} ${humanizeSeconds(time)}`}
              </span>
            ) : null
          }
          {recording
            ? <span aria-hidden>{humanizeSeconds(time)}</span> : <span>{recordTitle}</span>}
        </div>
      </div>
    );

    const recordMeetingButtonWithTooltip = (
      <Tooltip title={intl.formatMessage(intlMessages.stopTitle)}>
        {recordMeetingButton}
      </Tooltip>
    );

    const recordingButton = recording ? recordMeetingButtonWithTooltip : recordMeetingButton;

    return (
      <div className={styles.recordingIndicator}>
        {showButton
          ? recordingButton
          : null }

        {showButton ? null : (
          <Tooltip
            title={`${intl.formatMessage(recording
              ? intlMessages.notificationRecordingStart
              : intlMessages.notificationRecordingStop)}`}
          >
            <div
              aria-label={`${intl.formatMessage(recording
                ? intlMessages.notificationRecordingStart
                : intlMessages.notificationRecordingStop)}`}
              className={styles.recordingStatusViewOnly}
            >
              {recordingIndicatorIcon}

              {recording
                ? <div className={styles.presentationTitle}>{humanizeSeconds(time)}</div> : null}
            </div>
          </Tooltip>
        )}
      </div>
    );
  }
}

RecordingIndicator.propTypes = propTypes;
RecordingIndicator.defaultProps = defaultProps;

export default injectIntl(RecordingIndicator);
