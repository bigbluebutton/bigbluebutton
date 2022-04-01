import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import AudioTestContainer from '/imports/ui/components/audio/audio-test/container';
import Styled from './styles';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  changeInputDevice: PropTypes.func.isRequired,
  changeOutputDevice: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleRetry: PropTypes.func.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  inputDeviceId: PropTypes.string.isRequired,
  outputDeviceId: PropTypes.string.isRequired,
};

const intlMessages = defineMessages({
  backLabel: {
    id: 'app.audio.backLabel',
    description: 'audio settings back button label',
  },
  descriptionLabel: {
    id: 'app.audio.audioSettings.descriptionLabel',
    description: 'audio settings description label',
  },
  micSourceLabel: {
    id: 'app.audio.audioSettings.microphoneSourceLabel',
    description: 'Label for mic source',
  },
  speakerSourceLabel: {
    id: 'app.audio.audioSettings.speakerSourceLabel',
    description: 'Label for speaker source',
  },
  testSpeakerLabel: {
    id: 'app.audio.audioSettings.testSpeakerLabel',
    description: 'Label for speaker source',
  },
  streamVolumeLabel: {
    id: 'app.audio.audioSettings.microphoneStreamLabel',
    description: 'Label for stream volume',
  },
  retryLabel: {
    id: 'app.audio.audioSettings.retryLabel',
    description: 'Retry button label',
  },
});

class AudioSettings extends React.Component {
  constructor(props) {
    super(props);

    const {
      inputDeviceId,
      outputDeviceId,
    } = props;

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleOutputChange = this.handleOutputChange.bind(this);

    this.state = {
      inputDeviceId,
      outputDeviceId,
    };
  }

  handleInputChange(deviceId) {
    const {
      changeInputDevice,
    } = this.props;

    changeInputDevice(deviceId);
    this.setState({
      inputDeviceId: deviceId,
    });
  }

  handleOutputChange(deviceId) {
    const {
      changeOutputDevice,
    } = this.props;

    changeOutputDevice(deviceId);
    this.setState({
      outputDeviceId: deviceId,
    });
  }

  render() {
    const {
      isConnecting,
      intl,
      handleBack,
      handleRetry,
    } = this.props;

    const { inputDeviceId, outputDeviceId } = this.state;

    return (
      <Styled.FormWrapper>
        <Styled.Form>
          <Styled.Row>
            <Styled.AudioNote>
              {intl.formatMessage(intlMessages.descriptionLabel)}
            </Styled.AudioNote>
          </Styled.Row>

          <Styled.Row>
            <Styled.Col>
              <Styled.FormElement>
                <Styled.LabelSmall htmlFor="inputDeviceSelector">
                  {intl.formatMessage(intlMessages.micSourceLabel)}
                  <Styled.DeviceSelectorSelect
                    id="inputDeviceSelector"
                    value={inputDeviceId}
                    kind="audioinput"
                    onChange={this.handleInputChange}
                  />
                </Styled.LabelSmall>
              </Styled.FormElement>
            </Styled.Col>
            <Styled.Col>
              <Styled.FormElement>
                <Styled.LabelSmall htmlFor="outputDeviceSelector">
                  {intl.formatMessage(intlMessages.speakerSourceLabel)}
                  <Styled.DeviceSelectorSelect
                    id="outputDeviceSelector"
                    value={outputDeviceId}
                    kind="audiooutput"
                    onChange={this.handleOutputChange}
                  />
                </Styled.LabelSmall>
              </Styled.FormElement>
            </Styled.Col>
          </Styled.Row>

          <Styled.Row>
            <Styled.SpacedLeftCol>
              <Styled.LabelSmall htmlFor="audioTest">
                {intl.formatMessage(intlMessages.testSpeakerLabel)}
                <AudioTestContainer id="audioTest" />
              </Styled.LabelSmall>
            </Styled.SpacedLeftCol>
          </Styled.Row>
        </Styled.Form>

        <Styled.EnterAudio>
          <Styled.BackButton
            label={intl.formatMessage(intlMessages.backLabel)}
            size="md"
            color="primary"
            onClick={handleBack}
            disabled={isConnecting}
            ghost
          />
          <Button
            size="md"
            color="primary"
            label={intl.formatMessage(intlMessages.retryLabel)}
            onClick={handleRetry}
          />
        </Styled.EnterAudio>
      </Styled.FormWrapper>
    );
  }
}

AudioSettings.propTypes = propTypes;

export default withModalMounter(injectIntl(AudioSettings));
