import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import Button from '/imports/ui/components/button/component';
import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import Modal from '/imports/ui/components/modal/simple/component';
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
  permissionError: {
    id: 'app.video.permissionError',
    description: 'Error message for webcam permission',
  },
  NotFoundError: {
    id: 'app.video.notFoundError',
    description: 'error message when can not get webcam video',
  },
  NotAllowedError: {
    id: 'app.video.notAllowed',
    description: 'error message when webcam had permission denied',
  },
  NotSupportedError: {
    id: 'app.video.notSupportedError',
    description: 'error message when origin do not have ssl valid',
  },
  NotReadableError: {
    id: 'app.video.notReadableError',
    description: 'error message When the webcam is being used by other software',
  },
});

class VideoPreview extends Component {
  constructor(props) {
    super(props);

    const {
      webcamDeviceId,
    } = props;

    this.handleJoinVideo = this.handleJoinVideo.bind(this);
    this.handleProceed = this.handleProceed.bind(this);
    this.handleStartSharing = this.handleStartSharing.bind(this);

    this.deviceStream = null;

    this.state = {
      webcamDeviceId,
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

  handlegUMError(error) {
    const {
      intl,
    } = this.props;
    const errorMessage = intlMessages[error.name]
      || intlMessages.permissionError;
    notify(intl.formatMessage(errorMessage), 'error', 'video');
    logger.error(error);
  }

  handleSelectWebcam(event) {
    const {
      changeWebcam,
    } = this.props;

    const webcamValue = event.target.value;
    this.setState({ webcamDeviceId: webcamValue });
    changeWebcam(webcamValue);
    VIDEO_CONSTRAINTS.deviceId = webcamValue ? { exact: webcamValue } : undefined;
    const constraints = {
      video: VIDEO_CONSTRAINTS,
    };
    this.stopTracks();
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      this.video.srcObject = stream;
      this.deviceStream = stream;
    }).catch((error) => {
      this.handlegUMError(error);
    });
  }

  handleStartSharing() {
    const { resolve, startSharing } = this.props;
    this.stopTracks();
    startSharing();
    if (resolve) resolve();
  }

  handleProceed() {
    const { resolve, closeModal } = this.props;
    closeModal();
    if (resolve) resolve();
  }

  componentDidMount() {
    const { webcamDeviceId, changeWebcam } = this.props;
    const constraints = {
      video: VIDEO_CONSTRAINTS,
    };

    navigator.mediaDevices.enumerateDevices().then((devices) => {
      let isInitialDeviceSet = false;
      const webcams = [];

      // set webcam
      if (webcamDeviceId) {
        changeWebcam(webcamDeviceId);
        this.setState({ webcamDeviceId });
        isInitialDeviceSet = true;
      }
      devices.forEach((device) => {
        if (device.kind === 'videoinput') {
          if (!isInitialDeviceSet) {
            changeWebcam(device.deviceId);
            this.setState({ webcamDeviceId: device.deviceId });
            isInitialDeviceSet = true;
          }
        }
      });
      if (webcams.length > 0) {
        this.setState({ availableWebcams: webcams });
      }

      constraints.video.deviceId = { exact: this.state.webcamDeviceId };
      navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
        // display the preview
        this.video.srcObject = stream;
        this.deviceStream = stream;

        navigator.mediaDevices.enumerateDevices().then((devices) => {
          // get the list of webcams (labels are available at this point)
          devices.forEach((device) => {
            if (device.kind === 'videoinput') {
              webcams.push(device);
            }
          });
          if (webcams.length > 0) {
            this.setState({ availableWebcams: webcams });
          }
        });
      });
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

    const {
      webcamDeviceId,
      availableWebcams,
      isStartSharingDisabled,
    } = this.state;
    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={this.handleProceed}
        hideBorder
      >
        <div className={styles.title}>
          {intl.formatMessage(intlMessages.webcamSettingsTitle)}
        </div>
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
            {availableWebcams && availableWebcams.length > 0 ? (
              <select
                value={webcamDeviceId}
                className={styles.select}
                onChange={this.handleSelectWebcam.bind(this)}
              >
                <option disabled>
                  {intl.formatMessage(intlMessages.webcamOptionLabel)}
                </option>
                {availableWebcams.map((webcam, index) => (
                  <option key={index} value={webcam.deviceId}>
                    {webcam.label}
                  </option>
                ))}
              </select>
            )
              : (
                <select
                  className={styles.select}
                >
                  <option disabled>
                    {intl.formatMessage(intlMessages.webcamNotFoundLabel)}
                  </option>
                </select>
              )}
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
              disabled={isStartSharingDisabled}
            />
          </div>
        </div>
      </Modal>
    );
  }
}

VideoPreview.propTypes = propTypes;

export default injectIntl(VideoPreview);
