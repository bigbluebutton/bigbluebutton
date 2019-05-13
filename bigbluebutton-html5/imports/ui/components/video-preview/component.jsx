import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  defineMessages, injectIntl, intlShape, FormattedMessage,
} from 'react-intl';
import Button from '/imports/ui/components/button/component';
// import { notify } from '/imports/ui/services/notification';
import logger from '/imports/startup/client/logger';
import Modal from '/imports/ui/components/modal/simple/component';
import browser from 'browser-detect';
import { styles } from './styles';


// const VIDEO_CONSTRAINTS = Meteor.settings.public.kurento.cameraConstraints;
const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;

const propTypes = {
  intl: intlShape.isRequired,
  closeModal: PropTypes.func.isRequired,
  startSharing: PropTypes.func.isRequired,
  changeWebcam: PropTypes.func.isRequired,
  changeProfile: PropTypes.func.isRequired,
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
  qualityLabel: {
    id: 'app.videoPreview.profileLabel',
    description: 'Quality dropdown label',
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
  profileNotFoundLabel: {
    id: 'app.videoPreview.profileNotFoundLabel',
    description: 'Profile not found label',
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
    // this.startPreview = this.startPreview.bind(this);
    this.scanProfiles = this.scanProfiles.bind(this);
    this.doGUM = this.doGUM.bind(this);
    this.displayPreview = this.displayPreview.bind(this);

    this.deviceStream = null;

    this._isMounted = false;

    this.state = {
      webcamDeviceId,
      availableWebcams: null,
      availableProfiles: {},
      selectedProfile: null,
      isStartSharingDisabled: true,
    };
  }

  stopTracks() {
    // console.log("in stop tracks");
    if (this.deviceStream) {
      // console.log("stopping tracks");
      this.deviceStream.getTracks().forEach((track) => {
        // console.log("found track to stop");
        track.stop();
      });
    }
  }

  handleGUMError(error) {
    // logger.error(error);
    // logger.error(error.id);
    // logger.error(error.name);
    // console.log(error);

    let convertedError;

    switch (error.name) {
      case 'SourceUnavailableError':
      case 'NotReadableError':
        // hardware failure with the device
        break;
      case 'NotAllowedError':
        // media was disallowed
        convertedError = intlMessages.NotAllowedError;
        break;
      case 'AbortError':
        // generic error occured
        break;
      case 'NotFoundError':
        // no webcam found
        convertedError = intlMessages.NotFoundError;
        break;
      case 'SecurityError':
        // user media support is disabled on the document
        break;
      case 'TypeError':
        // issue with constraints or maybe Chrome with HTTP
        break;
      default:
        // default error message handling
        break;
    }
  }

  handleSelectWebcam(event) {
    const webcamValue = event.target.value;

    this.scanProfiles(webcamValue);
  }

  handleSelectProfile(event) {
    const profileValue = event.target.value;
    const { webcamDeviceId } = this.state;

    const selectedProfile = CAMERA_PROFILES.find(profile => profile.id === profileValue);

    this.displayPreview(webcamDeviceId, selectedProfile);
  }

  handleStartSharing() {
    const { resolve, startSharing } = this.props;
    this.stopTracks();
    startSharing();
    if (resolve) resolve();
  }

  handleProceed() {
    const { resolve, closeModal } = this.props;
    this.stopTracks();
    closeModal();
    if (resolve) resolve();
  }

  scanProfiles(deviceId) {
    const { changeWebcam } = this.props;

    this.stopTracks();

    this.setState({ webcamDeviceId: deviceId });
    changeWebcam(deviceId);

    const availableProfiles = [];
    let currNum = 0;
    let previousWidth = 0;
    let previousHeight = 0;

    this.setState({
      scanning: true,
      isStartSharingDisabled: true,
    });

    // logger.debug('starting scan');

    const checkWebcamExists = () => {
      // logger.debug('initial webcam check');
      // we call gUM with no constraints so we know if any stream is available
      this.doGUM(deviceId, {}).then((stream) => {
        if (!this._isMounted) return;

        // We don't need to do anything with the returned stream
        nextProfile();
      }).catch((error) => {
        if (!this._isMounted) return;

        // webcam might no longer exist or be available
        logger.debug(`Error with profile: ${CAMERA_PROFILES[currNum].name}`);

        this.handleGUMError(error);

        scanningCleanup();
      });
    };

    const nextProfile = () => {
      // logger.debug('next profile');
      if (currNum < CAMERA_PROFILES.length) {
        this.doGUM(deviceId, CAMERA_PROFILES[currNum]).then((stream) => {
          if (!this._isMounted) return;

          logger.debug(`Display preview came back for profile: ${CAMERA_PROFILES[currNum].name}`);
          this.video.srcObject = stream;
          this.deviceStream = stream;
        }).catch((error) => {
          if (!this._isMounted) return;

          logger.debug(`Error with fetching profile {${CAMERA_PROFILES[currNum].name}} skipping to next profile. Error is {${error.name}}`);
          currNum++;
          nextProfile();
        });
      } else {
        // do clean up and select the starting profile
        scanningCleanup();
      }
    };

    const getVideoDimensions = () => {
      // logger.debug('loaded metadata');
      if (!this.video.videoWidth) {
        // logger.debug('no video width yet');
        setTimeout(getVideoDimensions, 250);
      }

      if (this.video.videoWidth !== previousWidth || this.video.videoHeight !== previousHeight) {
        previousWidth = this.video.videoWidth;
        previousHeight = this.video.videoHeight;
        logger.debug(`Found profile ${CAMERA_PROFILES[currNum].name}`);
        availableProfiles.push(CAMERA_PROFILES[currNum]);
      } else {
        logger.debug(`Not including profile ${CAMERA_PROFILES[currNum].name}`);
      }

      currNum++;
      nextProfile();
    };

    const scanningCleanup = () => {
      this.video.onloadedmetadata = undefined;

      if (availableProfiles.length > 0) {
        const defaultProfile = availableProfiles.find(profile => profile.default)
          || availableProfiles[0];
        logger.debug(`Found default profile: ${JSON.stringify(defaultProfile)}`);

        this.displayPreview(deviceId, defaultProfile);
      }

      this.setState({
        scanning: false,
        availableProfiles,
      });
    };

    this.video.onloadedmetadata = getVideoDimensions;

    checkWebcamExists();
  }

  doGUM(deviceId, profile) {
    const constraints = {
      audio: false,
      video: { ...profile.constraints },
    };
    constraints.video.deviceId = { exact: deviceId };

    this.stopTracks();
    this.video.srcObject = null;
    this.deviceStream = null;

    return navigator.mediaDevices.getUserMedia(constraints);
  }

  displayPreview(deviceId, profile) {
    const { changeProfile } = this.props;

    this.setState({ selectedProfile: profile.id });
    changeProfile(profile.id);

    this.doGUM(deviceId, profile).then((stream) => {
      if (!this._isMounted) return;

      this.setState({
        isStartSharingDisabled: false,
      });
      this.video.srcObject = stream;
      this.deviceStream = stream;
    }).catch((error) => {
      logger.warning({ logCode: 'video_preview_error' }, `Error displaying final selection. name: [${error.name}] message: [${error.message}]`);
      // logger.debug(error);
    });
  }

  componentDidMount() {
    const { webcamDeviceId } = this.props;

    this._isMounted = true;

    // Have to request any device to get past checks before finding devices. If this is
    // skipped then we get devices with no labels
    try {
      navigator.mediaDevices.getUserMedia({ audio: false, video: true }).then((stream) => {
        if (!this._isMounted) return;

        navigator.mediaDevices.enumerateDevices().then(async (devices) => {
          const webcams = [];
          let initialDeviceId;

          if (!this._isMounted) return;

          // set webcam
          devices.forEach((device) => {
            if (device.kind === 'videoinput') {
              webcams.push(device);
              if (!initialDeviceId || (webcamDeviceId && webcamDeviceId === device.deviceId)) {
                initialDeviceId = device.deviceId;
              }
            }
          });

          logger.debug(`Enumerate devices came back. There are ${devices.length} devices and ${webcams.length} are video inputs`);

          if (initialDeviceId) {
            this.setState({
              availableWebcams: webcams,
            });

            this.scanProfiles(initialDeviceId);
          }
        }).catch((error) => {
          // CHANGE THIS TO SOMETHING USEFUL
          logger.warning(`Error enumerating devices. name: [${error.name}] message: [${error.message}]`);
          this.handleGUMError(error);
        });
      });
    } catch (error) {
      // CHANGE THIS TO SOMETHING USEFUL
      logger.warning(`Error grabbing initial video stream. name: [${error.name}] message: [${error.message}]`);
      this.handleGUMError(error);
    }
  }

  componentWillUnmount() {
    // console.log("unmounting video preview");
    this.stopTracks();
    this.deviceStream = null;
    if (this.video) {
      // console.log("clear video srcObject");
      this.video.srcObject = null;
    }

    this._isMounted = false;
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
      availableProfiles,
      selectedProfile,
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
          <div className={styles.col}>
            <label className={styles.label}>
              {intl.formatMessage(intlMessages.cameraLabel)}
            </label>
            {availableWebcams && availableWebcams.length > 0 ? (
              <select
                value={webcamDeviceId}
                className={styles.select}
                onChange={this.handleSelectWebcam.bind(this)}
              >
                {availableWebcams.map(webcam => (
                  <option key={webcam.deviceId} value={webcam.deviceId}>
                    {webcam.label}
                  </option>
                ))}
              </select>
            )
              : (
                <span>
                  {intl.formatMessage(intlMessages.webcamNotFoundLabel)}
                </span>
              )}
            <label className={styles.label}>
              {intl.formatMessage(intlMessages.qualityLabel)}
            </label>
            {availableProfiles && availableProfiles.length > 0 ? (
              <select
                value={selectedProfile}
                className={styles.select}
                onChange={this.handleSelectProfile.bind(this)}
              >
                {availableProfiles.map(profile => (
                  <option key={profile.id} value={profile.id}>
                    {profile.name}
                  </option>
                ))}
              </select>
            )
              : (
                <span>
                  {intl.formatMessage(intlMessages.profileNotFoundLabel)}
                </span>
              )}
          </div>
        </div>
        {browser().name === 'edge' || browser().name === 'ie' ? (
          <p className={styles.browserWarning}>
            <FormattedMessage
              id="app.audioModal.unsupportedBrowserLabel"
              description="Warning when someone joins with a browser that isnt supported"
              values={{
                0: <a href="https://www.google.com/chrome/">Chrome</a>,
                1: <a href="https://getfirefox.com">Firefox</a>,
              }}
            />
          </p>
        ) : null }
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
