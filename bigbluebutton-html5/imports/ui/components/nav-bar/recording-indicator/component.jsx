import React, { PureComponent, Fragment } from 'react';
import RecordingContainer from '/imports/ui/components/recording/container';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import Tooltip from '/imports/ui/components/common/tooltip/component';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';
import RecordingNotifyContainer from './notify/container';

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
  recordingIndicatorOn: {
    id: 'app.navBar.recording.on',
    description: 'label for indicator when the session is being recorded',
  },
  recordingIndicatorOff: {
    id: 'app.navBar.recording.off',
    description: 'label for indicator when the session is not being recorded',
  },
  emptyAudioBrdige: {
    id: 'app.navBar.emptyAudioBrdige',
    description: 'message for notification when recording starts with no users in audio bridge',
  },
});

const propTypes = {
  intl: PropTypes.object.isRequired,
  amIModerator: PropTypes.bool,
  record: PropTypes.bool,
  recording: PropTypes.bool,
  mountModal: PropTypes.func.isRequired,
  time: PropTypes.number,
  allowStartStopRecording: PropTypes.bool.isRequired,
};

const defaultProps = {
  amIModerator: false,
  record: false,
  recording: false,
  time: 0,
};

class RecordingIndicator extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      time: (props.time ? props.time : 0),
      shouldNotify: false,
    };

    this.incrementTime = this.incrementTime.bind(this);
    this.toggleShouldNotify = this.toggleShouldNotify.bind(this);
  }

  toggleShouldNotify() {
    const { shouldNotify } = this.state;
    this.setState({shouldNotify: !shouldNotify});
  }

  componentDidMount() {
    const { recording, recordingNotificationEnabled } = this.props;

    if (recordingNotificationEnabled && recording) {
      this.toggleShouldNotify();
    }
  }

  componentDidUpdate(prevProps) {
    const { recording, mountModal, getModal, recordingNotificationEnabled } = this.props;
    const { shouldNotify } = this.state;

    if (!recording) {
      clearInterval(this.interval);
      this.interval = null;
    } else if (this.interval === null) {
      this.interval = setInterval(this.incrementTime, 1000);
    }

    if (recordingNotificationEnabled) {
      if (!prevProps.recording && recording && !shouldNotify) {
        return this.setState({shouldNotify: true});
      }
  
      const isModalOpen = !!getModal();
  
      // should only display notification modal when other modals are closed
      if (shouldNotify && !isModalOpen) {
        mountModal(<RecordingNotifyContainer toggleShouldNotify={this.toggleShouldNotify} />);
      }  
    }
  }

  incrementTime() {
    const { time: propTime } = this.props;
    const { time } = this.state;

    if (propTime > time) {
      this.setState({ time: propTime + 1 });
    } else {
      this.setState({ time: time + 1 });
    }
  }

  render() {
    const {
      record,
      recording,
      mountModal,
      amIModerator,
      intl,
      allowStartStopRecording,
      notify,
      micUser,
      isPhone,
    } = this.props;

    const { time } = this.state;
    if (!record) return null;

    if (!this.interval && recording) {
      this.interval = setInterval(this.incrementTime, 1000);
    }

    const title = intl.formatMessage(recording ? intlMessages.recordingIndicatorOn
      : intlMessages.recordingIndicatorOff);

    let recordTitle = '';

    if (!isPhone) {
      if (!recording) {
        recordTitle = time > 0
          ? intl.formatMessage(intlMessages.resumeTitle)
          : intl.formatMessage(intlMessages.startTitle);
      } else {
        recordTitle = intl.formatMessage(intlMessages.stopTitle);
      }
    }

    const recordingToggle = () => {
      if (!micUser && !recording) {
        notify(intl.formatMessage(intlMessages.emptyAudioBrdige), 'error', 'warning');
      }
      mountModal(<RecordingContainer amIModerator={amIModerator} />);
      document.activeElement.blur();
    };

    const recordingIndicatorIcon = (
      <Styled.RecordingIndicatorIcon titleMargin={!isPhone || recording} data-test="mainWhiteboard">
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
              stroke="#FFF"
              fill="#FFF"
              r={recording ? '5' : '4'}
              cx="10"
              cy="10"
            />
          </g>
        </svg>
      </Styled.RecordingIndicatorIcon>
    );

    const showButton = amIModerator && allowStartStopRecording;

    const recordMeetingButton = (
      <Styled.RecordingControl
        aria-label={recordTitle}
        aria-describedby={"recording-description"}
        recording={recording}
        role="button"
        tabIndex={0}
        key="recording-toggle"
        onClick={recordingToggle}
        onKeyPress={recordingToggle}
      >
        {recordingIndicatorIcon}
        <Styled.PresentationTitle>
          <Styled.VisuallyHidden id={"recording-description"}>
            {`${title} ${recording ? humanizeSeconds(time) : ''}`}
          </Styled.VisuallyHidden>
          {recording
            ? <span aria-hidden>{humanizeSeconds(time)}</span> : <span>{recordTitle}</span>}
        </Styled.PresentationTitle>
      </Styled.RecordingControl>
    );

    const recordMeetingButtonWithTooltip = (
      <Tooltip title={intl.formatMessage(intlMessages.stopTitle)}>
        {recordMeetingButton}
      </Tooltip>
    );

    const recordingButton = recording ? recordMeetingButtonWithTooltip : recordMeetingButton;

    return (
      <Fragment>
        {record
          ? <Styled.PresentationTitleSeparator aria-hidden>|</Styled.PresentationTitleSeparator>
          : null}
        <Styled.RecordingIndicator data-test="recordingIndicator">
          {showButton
            ? recordingButton
            : null}

          {showButton ? null : (
            <Tooltip
              title={`${intl.formatMessage(recording
                ? intlMessages.notificationRecordingStart
                : intlMessages.notificationRecordingStop)}`}
            >
              <Styled.RecordingStatusViewOnly
                aria-label={`${intl.formatMessage(recording
                  ? intlMessages.notificationRecordingStart
                  : intlMessages.notificationRecordingStop)}`}
                  recording={recording}
              >
                {recordingIndicatorIcon}

                {recording
                  ? <Styled.PresentationTitle>{humanizeSeconds(time)}</Styled.PresentationTitle> : null}
              </Styled.RecordingStatusViewOnly>
            </Tooltip>
          )}
        </Styled.RecordingIndicator>
      </Fragment>
    );
  }
}

RecordingIndicator.propTypes = propTypes;
RecordingIndicator.defaultProps = defaultProps;

export default injectIntl(RecordingIndicator);
