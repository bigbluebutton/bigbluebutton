import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import ModalBase from '/imports/ui/components/modal/base/component';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import { styles } from './styles';

const VIDEO_CONSTRAINTS = Meteor.settings.public.kurento.cameraConstraints;

const propTypes = {
  intl: intlShape.isRequired,
  closeModal: PropTypes.func.isRequired,
  startSharing: PropTypes.func.isRequired,
  changeWebcam: PropTypes.func.isRequired,
};

const intlMessages = defineMessages({
  webcamSettingsTitle: {
    id: 'app.videoPreview.webcamSettingsTitle',
    description: 'Title for the video preview modal',
  },
  closeLabel: {
    id: 'app.videoPreview.closeLabel',
    description: 'Close button label',
  },
  webcamPreviewLabel: {
    id: 'app.videoPreview.webcamPreviewLabel',
    description: 'Webcam preview label',
  },
  cameraLabel: {
    id: 'app.videoPreview.cameraLabel',
    description: 'Camera dropdown label',
  },
  cancelLabel: {
    id: 'app.videoPreview.cancelLabel',
    description: 'Cancel button label',
  },
  startSharingLabel: {
    id: 'app.videoPreview.startSharingLabel',
    description: 'Start Sharing button label',
  },
  webcamOptionLabel: {
    id: 'app.videoPreview.webcamOptionLabel',
    description: 'Default webcam option label',
  },
  webcamNotFoundLabel: {
    id: 'app.videoPreview.webcamNotFoundLabel',
    description: 'Webcam not found label',
  },
  sharingError: {
    id: 'app.video.sharingError',
    description: 'Error on sharing webcam',
  },
});

class VideoPreview extends Component {
  constructor(props) {
    super(props);

    const {
      closeModal,
      startSharing,
      changeWebcam,
      webcamDeviceId,
    } = props;

    this.handleJoinVideo = this.handleJoinVideo.bind(this);
    this.handleProceed = this.handleProceed.bind(this);
    this.handleStartSharing = this.handleStartSharing.bind(this);
    this.closeModal = closeModal;
    this.startSharing = startSharing;
    this.changeWebcam = changeWebcam;
    this.webcamDeviceId = webcamDeviceId;

    this.deviceStream = null;

    this.state = {
      webcamDeviceId: this.webcamDeviceId,
      availableWebcams: null,
      isStartSharingDisabled: false,
    };
  }

  stopTracks() {
    if (this.deviceStream) {
      this.deviceStream.getTracks().forEach((track) => {
        track.stop();
      });
    }
  }

  handleSelectWebcam(event) {
    const {
      intl,
    } = this.props;

    const webcamValue = event.target.value;
    this.setState({ webcamDeviceId: webcamValue });
    this.changeWebcam(webcamValue);
    VIDEO_CONSTRAINTS.deviceId = webcamValue ? { exact: webcamValue } : undefined;
    const constraints = {
      video: VIDEO_CONSTRAINTS,
    };
    this.stopTracks();
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      this.video.srcObject = stream;
      this.deviceStream = stream;
    }).catch((error) => {
      notify(intl.formatMessage(intlMessages.sharingError), 'error', 'video');
      logger.error(error);
    });
  }

  handleStartSharing() {
    const { resolve } = this.props;
    this.stopTracks();
    this.startSharing();
    if (resolve) resolve();
  }

  handleProceed() {
    const { resolve } = this.props;
    this.closeModal();
    if (resolve) resolve();
  }

  componentDidMount() {
    const { webcamDeviceId } = this.props;
    const constraints = {
      video: VIDEO_CONSTRAINTS,
    };
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      this.video.srcObject = stream;
      this.deviceStream = stream;
      navigator.mediaDevices.enumerateDevices().then((devices) => {
        let isInitialDeviceSet = false;
        const webcams = [];
        if (webcamDeviceId) {
          this.changeWebcam(webcamDeviceId);
          this.setState({ webcamDeviceId });
          isInitialDeviceSet = true;
        }
        devices.forEach((device) => {
          if (device.kind === 'videoinput') {
            webcams.push(device);
            if (!isInitialDeviceSet) {
              this.changeWebcam(device.deviceId);
              this.setState({ webcamDeviceId: device.deviceId });
              isInitialDeviceSet = true;
            }
          }
        });
        if (webcams.length > 0) {
          this.setState({ availableWebcams: webcams });
        }
      });
    }).catch(() => {
      this.setState({ isStartSharingDisabled: true });
    });
  }

  handleJoinVideo() {
    const {
      joinVideo,
    } = this.props;

    joinVideo();
  }

  render() {
    const {
      intl,
    } = this.props;

    return (
      <span>
        <ModalBase
          overlayClassName={styles.overlay}
          className={styles.modal}
          onRequestClose={this.handleProceed}
        >
          <header
            className={styles.header}
          >
            <Button
              className={styles.closeBtn}
              label={intl.formatMessage(intlMessages.closeLabel)}
              icon="close"
              size="md"
              hideLabel
              onClick={this.handleProceed}
            />
          </header>
          <h3 className={styles.title}>
            {intl.formatMessage(intlMessages.webcamSettingsTitle)}
          </h3>
          <div className={styles.content}>
            <div className={styles.col}>
              <video
                id="preview"
                className={styles.preview}
                ref={(ref) => { this.video = ref; }}
                autoPlay
                playsInline
              />
            </div>
            <div className={styles.options}>
              <label className={styles.label}>
                {intl.formatMessage(intlMessages.cameraLabel)}
              </label>
              {this.state.availableWebcams && this.state.availableWebcams.length > 0 ? (
                <select
                  value={this.state.webcamDeviceId}
                  className={styles.select}
                  onChange={this.handleSelectWebcam.bind(this)}
                >
                  <option disabled>
                    {intl.formatMessage(intlMessages.webcamOptionLabel)}
                  </option>
                  {this.state.availableWebcams.map((webcam, index) => (
                    <option key={index} value={webcam.deviceId}>
                      {webcam.label}
                    </option>
                  ))}
                </select>
              ) :
                <select
                  className={styles.select}
                >
                  <option disabled>
                    {intl.formatMessage(intlMessages.webcamNotFoundLabel)}
                  </option>
                </select>}
            </div>
          </div>
          <div className={styles.footer}>
            <div className={styles.actions}>
              <Button
                label={intl.formatMessage(intlMessages.cancelLabel)}
                onClick={this.handleProceed}
              />
              <Button
                color="primary"
                label={intl.formatMessage(intlMessages.startSharingLabel)}
                onClick={() => this.handleStartSharing()}
                disabled={this.state.isStartSharingDisabled}
              />
            </div>
          </div>
        </ModalBase>
      </span>
    );
  }
}

VideoPreview.propTypes = propTypes;

export default injectIntl(VideoPreview);

