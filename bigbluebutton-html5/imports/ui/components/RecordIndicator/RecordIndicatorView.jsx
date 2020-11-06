import React, { PureComponent } from 'react';
import RecordingContainer from '/imports/ui/components/recording/container';
import humanizeSeconds from '/imports/utils/humanizeSeconds';
import Tooltip from '/imports/ui/components/tooltip/component';
import { defineMessages, injectIntl } from 'react-intl';
import { IconButton } from '../common';

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

class RecordIndicator extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      time: (props.time ? props.time : 0),
    };

    this.incrementTime = this.incrementTime.bind(this);
  }

  componentDidUpdate() {
    const { recording } = this.props;

    if (!recording) {
      clearInterval(this.interval);
      this.interval = null;
    } else if (this.interval === null) {
      this.interval = setInterval(this.incrementTime, 1000);
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
    } = this.props;

    const { time } = this.state;
    if (!record) return null;

    if (!this.interval && recording) {
      this.interval = setInterval(this.incrementTime, 1000);
    }

    const recordingToggle = () => {
      if (!micUser && !recording) {
        notify(intl.formatMessage(intlMessages.emptyAudioBrdige), 'error', 'warning');
      }
      mountModal(<RecordingContainer amIModerator={amIModerator} />);
      document.activeElement.blur();
    };

    const showButton = amIModerator && allowStartStopRecording;

    const recordMeetingButton = recording
      ? (
        <IconButton
          color="error"
          onClick={recordingToggle}
          onKeyPress={recordingToggle}
        >
          { humanizeSeconds(time) }
        </IconButton>
      )
      : (
        <IconButton
          color="secondary"
          icon="record"
          onClick={recordingToggle}
          onKeyPress={recordingToggle}
        />
      );


    const recordMeetingButtonWithTooltip = (
      <Tooltip title={intl.formatMessage(intlMessages.stopTitle)}>
        {recordMeetingButton}
      </Tooltip>
    );

    const recordingButton = recording ? recordMeetingButtonWithTooltip : recordMeetingButton;

    return showButton ? recordingButton : null;
  }
}

export default injectIntl(RecordIndicator);
