import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import { withModalMounter } from '/imports/ui/components/common/modal/service';
import AudioTestContainer from '/imports/ui/components/audio/audio-test/container';
import Styled from './styles';
import logger from '/imports/startup/client/logger';
import AudioStreamVolume from '/imports/ui/components/audio/audio-stream-volume/component';
import LocalEchoContainer from '/imports/ui/components/audio/local-echo/container';
import {
  getAudioConstraints,
} from '/imports/api/audio/client/bridge/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  changeInputDevice: PropTypes.func.isRequired,
  changeOutputDevice: PropTypes.func.isRequired,
  handleBack: PropTypes.func.isRequired,
  handleConfirmation: PropTypes.func.isRequired,
  handleGUMFailure: PropTypes.func.isRequired,
  isConnecting: PropTypes.bool.isRequired,
  inputDeviceId: PropTypes.string.isRequired,
  outputDeviceId: PropTypes.string.isRequired,
  withEcho: PropTypes.bool.isRequired,
  withVolumeMeter: PropTypes.bool.isRequired,
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
    description: 'Label for the speaker test button',
  },
  streamVolumeLabel: {
    id: 'app.audio.audioSettings.microphoneStreamLabel',
    description: 'Label for stream volume',
  },
  retryLabel: {
    id: 'app.audio.joinAudio',
    description: 'Confirmation button label',
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
    this.handleConfirmationClick = this.handleConfirmationClick.bind(this);

    this.state = {
      inputDeviceId,
      outputDeviceId,
      stream: null,
    };

    this._isMounted = false;
  }

  componentDidMount() {
    const { inputDeviceId } = this.state;
    this._isMounted = true;
    this.handleInputChange(inputDeviceId);
  }

  componentWillUnmount() {
    const { stream } = this.state;

    this._mounted = false;

    if (stream) {
      MediaStreamUtils.stopMediaStreamTracks(stream);
    }
  }

  generateInputStream(inputDeviceId) {
    const { stream } = this.state;

    if (inputDeviceId && stream) {
      const currentDeviceId = MediaStreamUtils.extractDeviceIdFromStream(stream, 'audio');

      if (currentDeviceId === inputDeviceId) return Promise.resolve(stream);

      MediaStreamUtils.stopMediaStreamTracks(stream);
    }

    const constraints = {
      audio: getAudioConstraints({ deviceId: inputDeviceId }),
    };

    return navigator.mediaDevices.getUserMedia(constraints)
  }

  handleInputChange(deviceId) {
    const {
      handleGUMFailure,
      changeInputDevice,
      withEcho,
      withVolumeMeter,
    } = this.props;

    changeInputDevice(deviceId);

    // Only generate input streams if they're going to be used with something
    // In this case, the volume meter or local echo test.
    if (withEcho || withVolumeMeter) {
      this.generateInputStream(deviceId).then((stream) => {
        if (!this._isMounted) return;
        this.setState({
          inputDeviceId: deviceId,
          stream,
        });
      }).catch((error) => {
        logger.warn({
          logCode: 'audiosettings_gum_failed',
          extraInfo: {
            deviceId,
            errorMessage: error.message,
            errorName: error.name,
          },
        }, `Audio settings gUM failed: ${error.name}`);
        handleGUMFailure(error);
      });
    } else {
      this.setState({
        inputDeviceId: deviceId,
      });
    }
  }

  handleOutputChange(deviceId) {
    const {
      changeOutputDevice,
      withEcho,
    } = this.props;

    changeOutputDevice(deviceId, withEcho);
    this.setState({
      outputDeviceId: deviceId,
    });
  }

  renderOutputTest() {
    const { withEcho, intl } = this.props;
    const { stream } = this.state;

    return (
      <Styled.Row>
        <Styled.SpacedLeftCol>
          <Styled.LabelSmall htmlFor="audioTest">
            {intl.formatMessage(intlMessages.testSpeakerLabel)}
            {!withEcho
              ? <AudioTestContainer id="audioTest" />
              : <LocalEchoContainer
                  intl={this.props.intl}
                  stream={stream}
                />
            }
          </Styled.LabelSmall>
        </Styled.SpacedLeftCol>
      </Styled.Row>
    );
  }

  renderVolumeMeter() {
    const { withVolumeMeter, intl } = this.props;
    const { stream } = this.state;

    return withVolumeMeter ? (
      <Styled.Row>
        <Styled.LabelSmallFullWidth htmlFor="audioStreamVolume">
          {intl.formatMessage(intlMessages.streamVolumeLabel)}
          <AudioStreamVolume
            stream={stream}
          />
        </Styled.LabelSmallFullWidth>
      </Styled.Row>
    ) : null
  }

  handleConfirmationClick () {
    const {
      withEcho,
      handleConfirmation,
    } = this.props;
    const {
      stream,
    } = this.state;

    // The local echo mode is not enabled or there isn't any stream in this:
    // just run the provided callback
    if (!withEcho || !stream) return handleConfirmation();

    // Local echo mode was enabled and there is a valid input stream => call
    // the confirmation callback with the input stream as arg so it can be used
    // in upstream components. The rationale is not surplus gUM calls.
    // We're cloning it because the original will be cleaned up on unmount here.
    const inputStream = stream.clone();
    return handleConfirmation(inputStream);
  }

  render() {
    const {
      isConnecting,
      intl,
      handleBack,
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
                    intl={intl}
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
                    intl={intl}
                  />
                </Styled.LabelSmall>
              </Styled.FormElement>
            </Styled.Col>
          </Styled.Row>

          {this.renderOutputTest()}
          {this.renderVolumeMeter()}
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
            onClick={this.handleConfirmationClick}
          />
        </Styled.EnterAudio>
      </Styled.FormWrapper>
    );
  }
}

AudioSettings.propTypes = propTypes;

export default withModalMounter(injectIntl(AudioSettings));
