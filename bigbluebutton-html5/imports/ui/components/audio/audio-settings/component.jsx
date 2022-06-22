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
import DeviceSelector from '/imports/ui/components/audio/device-selector/component';
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
  produceStreams: PropTypes.bool,
  withEcho: PropTypes.bool,
  withVolumeMeter: PropTypes.bool,
};

const defaultProps = {
  produceStreams: false,
  withEcho: false,
  withVolumeMeter: false,
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
      // If streams need to be produced, device selectors are blocked until
      // at least one stream is generated
      deviceSelectorsBlocked: props.produceStreams,
      stream: null,
    };

    this._isMounted = false;
  }

  componentDidMount() {
    const { inputDeviceId, outputDeviceId } = this.state;

    this._isMounted = true;
    // Guarantee initial in/out devices are initialized on all ends
    this.setInputDevice(inputDeviceId);
    this.setOutputDevice(outputDeviceId);
  }

  componentWillUnmount() {
    const { stream } = this.state;

    this._mounted = false;

    if (stream) {
      MediaStreamUtils.stopMediaStreamTracks(stream);
    }
  }

  handleInputChange(deviceId) {
    this.setInputDevice(deviceId);
  }

  handleOutputChange(deviceId) {
    this.setOutputDevice(deviceId);
  }

  handleConfirmationClick() {
    const { stream } = this.state;
    const {
      produceStreams,
      handleConfirmation,
    } = this.props;

    // Stream generation disabled or there isn't any stream: just run the provided callback
    if (!produceStreams || !stream) return handleConfirmation();

    // Stream generation enabled and there is a valid input stream => call
    // the confirmation callback with the input stream as arg so it can be used
    // in upstream components. The rationale is no surplus gUM calls.
    // We're cloning it because the original will be cleaned up on unmount here.
    const clonedStream = stream.clone();
    return handleConfirmation(clonedStream);
  }

  setInputDevice(deviceId) {
    const {
      handleGUMFailure,
      changeInputDevice,
      produceStreams,
    } = this.props;

    changeInputDevice(deviceId);

    // Only generate input streams if they're going to be used with something
    // In this case, the volume meter or local echo test.
    if (produceStreams) {
      this.generateInputStream(deviceId).then((stream) => {
        if (!this._isMounted) return;

        this.setState({
          // We extract the deviceId again from the stream to guarantee consistency
          // between stream vs chosen device
          inputDeviceId: MediaStreamUtils.extractDeviceIdFromStream(stream, 'audio'),
          stream,
          deviceSelectorsBlocked: false,
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

  setOutputDevice(deviceId) {
    const {
      changeOutputDevice,
      withEcho,
    } = this.props;

    // withEcho usage (isLive arg): if local echo is enabled we need the device
    // change to be performed seamlessly (which is what the isLive parameter guarantes)
    changeOutputDevice(deviceId, withEcho);

    this.setState({
      outputDeviceId: deviceId,
    });
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

    return navigator.mediaDevices.getUserMedia(constraints);
  }

  renderOutputTest() {
    const { withEcho, intl } = this.props;
    const { stream } = this.state;

    return (
      <Styled.Row>
        <Styled.SpacedLeftCol>
          <Styled.LabelSmall htmlFor="audioTest">
            {!withEcho
              ? <AudioTestContainer id="audioTest" />
              : (
                <LocalEchoContainer
                  intl={intl}
                  stream={stream}
                />
              )}
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
    ) : null;
  }

  renderDeviceSelectors() {
    const { inputDeviceId, outputDeviceId, deviceSelectorsBlocked } = this.state;
    const { intl } = this.props;

    return (
      <Styled.Row>
        <Styled.Col>
          <Styled.FormElement>
            <Styled.LabelSmall htmlFor="inputDeviceSelector">
              {intl.formatMessage(intlMessages.micSourceLabel)}
              <DeviceSelector
                id="inputDeviceSelector"
                deviceId={inputDeviceId}
                kind="audioinput"
                blocked={deviceSelectorsBlocked}
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
              <DeviceSelector
                id="outputDeviceSelector"
                deviceId={outputDeviceId}
                kind="audiooutput"
                blocked={deviceSelectorsBlocked}
                onChange={this.handleOutputChange}
                intl={intl}
              />
            </Styled.LabelSmall>
          </Styled.FormElement>
        </Styled.Col>
      </Styled.Row>
    );
  }

  render() {
    const {
      isConnecting,
      intl,
      handleBack,
    } = this.props;

    return (
      <Styled.FormWrapper>
        <Styled.Form>
          <Styled.Row>
            <Styled.AudioNote>
              {intl.formatMessage(intlMessages.descriptionLabel)}
            </Styled.AudioNote>
          </Styled.Row>
          {this.renderDeviceSelectors()}
          {this.renderOutputTest()}
          {this.renderVolumeMeter()}
        </Styled.Form>

        <Styled.EnterAudio>
          <Styled.BackButton
            label={intl.formatMessage(intlMessages.backLabel)}
            color="secondary"
            onClick={handleBack}
            disabled={isConnecting}
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
AudioSettings.defaultProps = defaultProps;

export default withModalMounter(injectIntl(AudioSettings));
