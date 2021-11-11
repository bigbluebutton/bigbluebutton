import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

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
  intl: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
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
      closeModal,
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
    return (
      <Styled.RecordingModal
        onRequestClose={closeModal}
        hideBorder
        contentLabel={title}
      >
        <Styled.Container>
          <Styled.Header>
            <Styled.Title>{title}</Styled.Title>
          </Styled.Header>
          <Styled.Description>
            {`${intl.formatMessage(!recordingStatus
              ? intlMessages.startDescription
              : intlMessages.stopDescription)}`}
          </Styled.Description>
          <Styled.Footer>
            <Styled.RecordingButton
              color="primary"
              disabled={!isMeteorConnected}
              label={intl.formatMessage(intlMessages.yesLabel)}
              onClick={toggleRecording}
            />
            <Styled.RecordingButton
              label={intl.formatMessage(intlMessages.noLabel)}
              onClick={closeModal}
            />
          </Styled.Footer>
        </Styled.Container>
      </Styled.RecordingModal>
    );
  }
}

RecordingComponent.propTypes = propTypes;
RecordingComponent.defaultProps = defaultProps;

export default injectIntl(RecordingComponent);
