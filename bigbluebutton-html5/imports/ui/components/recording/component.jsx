import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import ConfirmationModal from '/imports/ui/components/common/modal/confirmation/component';

const intlMessages = defineMessages({
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
  startDescription: {
    id: 'app.recording.startDescription',
    description: 'start recording description',
  },
  stopDescription: {
    id: 'app.recording.stopDescription',
    description: 'stop recording description',
  },
});

const propTypes = {
  intl: PropTypes.object.isRequired,
  toggleRecording: PropTypes.func.isRequired,
  recordingTime: PropTypes.number,
  recordingStatus: PropTypes.bool,
  amIModerator: PropTypes.bool,
  isMeteorConnected: PropTypes.bool.isRequired,
};

const defaultProps = {
  recordingTime: -1,
  recordingStatus: false,
  amIModerator: false,
};

class RecordingComponent extends PureComponent {
  render() {
    const {
      intl,
      recordingStatus,
      recordingTime,
      amIModerator,
      toggleRecording,
      isMeteorConnected,
    } = this.props;

    let title;

    if (!recordingStatus) {
      title = recordingTime >= 0 ? intl.formatMessage(intlMessages.resumeTitle)
        : intl.formatMessage(intlMessages.startTitle);
    } else {
      title = intl.formatMessage(intlMessages.stopTitle);
    }

    if (!amIModerator) return null;

    const description = intl.formatMessage(!recordingStatus
      ? intlMessages.startDescription
      : intlMessages.stopDescription);

    return (
      <ConfirmationModal
        intl={intl}
        onConfirm={toggleRecording}
        title={title}
        description={description}
        disableConfirmButton={!isMeteorConnected}
      />
    );
  }
}

RecordingComponent.propTypes = propTypes;
RecordingComponent.defaultProps = defaultProps;

export default injectIntl(RecordingComponent);
