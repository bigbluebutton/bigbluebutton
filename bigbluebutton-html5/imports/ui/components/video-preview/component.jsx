import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  defineMessages, injectIntl, FormattedMessage,
} from 'react-intl';
import Button from '/imports/ui/components/button/component';
import logger from '/imports/startup/client/logger';
import Modal from '/imports/ui/components/modal/simple/component';
import browserInfo from '/imports/utils/browserInfo';
import cx from 'classnames';
import PreviewService from './service';
import VideoService from '../video-provider/service';
import { styles } from './styles';
import deviceInfo from '/imports/utils/deviceInfo';
import MediaStreamUtils from '/imports/utils/media-stream-utils';

const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;
const GUM_TIMEOUT = Meteor.settings.public.kurento.gUMTimeout;

const VIEW_STATES = {
  finding: 'finding',
  found: 'found',
  error: 'error',
};

const propTypes = {
  intl: PropTypes.object.isRequired,
  closeModal: PropTypes.func.isRequired,
  startSharing: PropTypes.func.isRequired,
  stopSharing: PropTypes.func.isRequired,
  resolve: PropTypes.func,
  hasVideoStream: PropTypes.bool.isRequired,
  webcamDeviceId: PropTypes.string,
  sharedDevices: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  resolve: null,
  webcamDeviceId: null,
  sharedDevices: [],
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
  low: {
    id: 'app.videoPreview.quality.low',
    description: 'Low quality option label',
  },
  medium: {
    id: 'app.videoPreview.quality.medium',
    description: 'Medium quality option label',
  },
  high: {
    id: 'app.videoPreview.quality.high',
    description: 'High quality option label',
  },
  hd: {
    id: 'app.videoPreview.quality.hd',
    description: 'High definition option label',
  },
  cancelLabel: {
    id: 'app.videoPreview.cancelLabel',
    description: 'Cancel button label',
  },
  startSharingLabel: {
    id: 'app.videoPreview.startSharingLabel',
    description: 'Start sharing button label',
  },
  stopSharingLabel: {
    id: 'app.videoPreview.stopSharingLabel',
    description: 'Stop sharing button label',
  },
  stopSharingAllLabel: {
    id: 'app.videoPreview.stopSharingAllLabel',
    description: 'Stop sharing all button label',
  },
  sharedCameraLabel: {
    id: 'app.videoPreview.sharedCameraLabel',
    description: 'Already Shared camera label',
  },
  findingWebcamsLabel: {
    id: 'app.videoPreview.findingWebcamsLabel',
    description: 'Finding webcams label',
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
  AbortError: {
    id: 'app.video.abortError',
    description: 'Some problem occurred which prevented the device from being used',
  },
  OverconstrainedError: {
    id: 'app.video.overconstrainedError',
    description: 'No candidate devices which met the criteria requested',
  },
  SecurityError: {
    id: 'app.video.securityError',
    description: 'Media support is disabled on the Document',
  },
  TypeError: {
    id: 'app.video.typeError',
    description: 'List of constraints specified is empty, or has all constraints set to false',
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
  TimeoutError: {
    id: 'app.video.timeoutError',
    description: 'error message when promise did not return',
  },
  iOSError: {
    id: 'app.audioModal.iOSBrowser',
    description: 'Audio/Video Not supported warning',
  },
  iOSErrorDescription: {
    id: 'app.audioModal.iOSErrorDescription',
    description: 'Audio/Video not supported description',
  },
  iOSErrorRecommendation: {
    id: 'app.audioModal.iOSErrorRecommendation',
    description: 'Audio/Video recommended action',
  },
  genericError: {
    id: 'app.video.genericError',
    description: 'error message for when the webcam sharing fails with unknown error',
  },
});

class VideoPreview extends Component {
  constructor(props) {
    super(props);

    const {
      webcamDeviceId,
    } = props;

    this.handleProceed = this.handleProceed.bind(this);
    this.handleStartSharing = this.handleStartSharing.bind(this);
    this.handleStopSharing = this.handleStopSharing.bind(this);
    this.handleStopSharingAll = this.handleStopSharingAll.bind(this);
    this.handleSelectWebcam = this.handleSelectWebcam.bind(this);
    this.handleSelectProfile = this.handleSelectProfile.bind(this);

    this.deviceStream = null;

    this._isMounted = false;

    this.state = {
      webcamDeviceId,
      availableWebcams: null,
      availableProfiles: {},
      selectedProfile: null,
      isStartSharingDisabled: true,
      viewState: VIEW_STATES.finding,
      deviceError: null,
      previewError: null,
    };

    this.userParameterProfile = VideoService.getUserParameterProfile();
    this.mirrorOwnWebcam = VideoService.mirrorOwnWebcam();
    this.skipVideoPreview = PreviewService.getSkipVideoPreview();
  }

  componentDidMount() {
    const {
      webcamDeviceId,
    } = this.props;

    this._isMounted = true;

    if (deviceInfo.hasMediaDevices) {
      try {
        let firstAllowedDeviceId;

        navigator.mediaDevices.enumerateDevices().then((devices) => {
          VideoService.updateNumberOfDevices(devices);
          // Late enumerateDevices resolution, stop.
          if (!this._isMounted) return;

          let {
            webcams,
            areLabelled,
            areIdentified
          } = PreviewService.digestVideoDevices(devices, webcamDeviceId);

          logger.debug({
            logCode: 'video_preview_enumerate_devices',
            extraInfo: {
              devices,
              webcams,
            },
          }, `Enumerate devices came back. There are ${devices.length} devices and ${webcams.length} are video inputs`);

          if (webcams.length > 0) {
            this.getInitialPreview(webcams[0].deviceId)
              .then(async () => {
                // Late gUM resolution, stop.
                if (!this._isMounted) return;

                if (!areLabelled || !areIdentified) {
                  // If they aren't labelled or have nullish deviceIds, run
                  // enumeration again and get their full versions
                  // Why: fingerprinting countermeasures obfuscate those when
                  // no permission was granted via gUM
                  const newDevices = await navigator.mediaDevices.enumerateDevices();
                  webcams = PreviewService.digestVideoDevices(newDevices, webcamDeviceId).webcams;
                }

                this.setState({
                  availableWebcams: webcams,
                });

                if (!this.skipVideoPreview) {
                  this.setState({
                    viewState: VIEW_STATES.found,
                  });
                }

                this.displayPreview();
              });
          } else {
            // There were no webcams coming from enumerateDevices. Throw an error.
            throw new Error('NotFoundError');
          }
        }).catch((error) => {
          this.handleDeviceError('enumerate', error, 'enumerating devices');
        });
      } catch (error) {
        this.handleDeviceError('grabbing', error, 'grabbing initial video stream');
      }
    } else {
      // Top-level navigator.mediaDevices is not supported.
      // The session went through the version checking, but somehow ended here.
      // Nothing we can do.
      const error = new Error('NotSupportedError');
      this.handleDeviceError('mount', error, ': navigator.mediaDevices unavailable');
    }
  }

  componentWillUnmount() {
    this.cleanupUnusedStream(this.deviceStream, this.state.webcamDeviceId);
    this.deviceStream = null;

    if (this.video) {
      this.video.srcObject = null;
    }

    this._isMounted = false;
  }

  handleSelectWebcam(event) {
    const webcamValue = event.target.value;

    this.getInitialPreview(webcamValue).then(() => {
      this.displayPreview();
    });
  }

  handleSelectProfile(event) {
    const profileValue = event.target.value;
    const { webcamDeviceId } = this.state;

    const selectedProfile = CAMERA_PROFILES.find(profile => profile.id === profileValue);

    this.getPreviewStream(webcamDeviceId, selectedProfile).then(() => {
      this.displayPreview();
    });
  }

  handleStartSharing() {
    const { resolve, startSharing } = this.props;
    const { webcamDeviceId } = this.state;
    // Only streams that will be shared should be stored in the service.
    // If the store call returns false, we're duplicating stuff. So clean this one
    // up because it's an impostor.
    if(!PreviewService.storeStream(webcamDeviceId, this.deviceStream)) {
      MediaStreamUtils.stopMediaStreamTracks(this.deviceStream);
    }
    this.deviceStream = null;
    startSharing(webcamDeviceId);
    if (resolve) resolve();
  }

  handleStopSharing() {
    const { resolve, stopSharing } = this.props;
    const { webcamDeviceId } = this.state;
    PreviewService.deleteStream(webcamDeviceId);
    stopSharing(webcamDeviceId);
    this.deviceStream = null;
    if (resolve) resolve();
  }

  handleStopSharingAll() {
    const { resolve, stopSharing } = this.props;
    stopSharing();
    if (resolve) resolve();
  }

  handleProceed() {
    const { resolve, closeModal } = this.props;

    this.cleanupUnusedStream(this.deviceStream, this.state.webcamDeviceId);
    closeModal();
    if (resolve) resolve();
  }

  handlePreviewError(logCode, error, description) {
    logger.warn({
      logCode: `video_preview_${logCode}_error`,
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, `Error ${description}`);
    this.setState({
      previewError: this.handleGUMError(error),
    });
  }

  handleDeviceError(logCode, error, description) {
    logger.warn({
      logCode: `video_preview_${logCode}_error`,
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
      },
    }, `Error ${description}`);
    this.setState({
      viewState: VIEW_STATES.error,
      deviceError: this.handleGUMError(error),
    });
  }

  handleGUMError(error) {
    const { intl } = this.props;

    logger.error({
      logCode: 'video_preview_gum_failure',
      extraInfo: {
        errorName: error.name, errorMessage: error.message,
      },
    }, 'getUserMedia failed in video-preview');

    const intlError = intlMessages[error.name] || intlMessages[error.message];
    if (intlError) {
      return intl.formatMessage(intlError);
    }

    return intl.formatMessage(intlMessages.genericError,
      { 0: `${error.name}: ${error.message}` });
  }

  cleanupUnusedStream (stream, deviceId) {
    // Cleanup current stream if it wasn't shared/stored
    if (stream && !PreviewService.hasStream(deviceId)) {
      MediaStreamUtils.stopMediaStreamTracks(stream);
    }
  }

  getInitialPreview(deviceId) {
    const { webcamDeviceId } = this.state;
    const availableProfiles = CAMERA_PROFILES.filter(p => !p.hidden);

    this.cleanupUnusedStream(this.deviceStream, webcamDeviceId);

    this.setState({
      webcamDeviceId: deviceId,
      isStartSharingDisabled: true,
      availableProfiles,
    });
    PreviewService.changeWebcam(deviceId);

    if (availableProfiles.length > 0) {
      const defaultProfile = availableProfiles.find(profile => profile.id === this.userParameterProfile)
        || availableProfiles.find(profile => profile.default)
        || availableProfiles[0];
      return this.getPreviewStream(deviceId, defaultProfile);
    } else {
      return Promise.resolve();
    }
  }

  doGUM(deviceId, profile) {
    // Check if this is an already loaded stream
    if (deviceId && PreviewService.hasStream(deviceId)) {
      return Promise.resolve(PreviewService.getStream(deviceId));
    }

    const constraints = {
      audio: false,
      video: { ...profile.constraints },
    };

    if (deviceId) {
      constraints.video.deviceId = { exact: deviceId };
    }

    if (this.video) {
      this.video.srcObject = null;
    }
    this.deviceStream = null;

    return PreviewService.promiseTimeout(GUM_TIMEOUT, navigator.mediaDevices.getUserMedia(constraints));
  }

  getPreviewStream(deviceId, profile) {
    this.setState({
      selectedProfile: profile.id,
      isStartSharingDisabled: true,
      previewError: undefined,
    });
    PreviewService.changeProfile(profile.id);

    if (this.skipVideoPreview) {
      this.handleStartSharing();
      return Promise.resolve();
    }

    return this.doGUM(deviceId, profile).then((stream) => {
      // Late GUM resolution, clean up tracks, stop.
      if (!this._isMounted) return this.cleanupUnusedStream(stream, deviceId);

      this.setState({
        isStartSharingDisabled: false,
      });

      this.deviceStream = stream;
    }).catch((error) => {
      this.handlePreviewError('do_gum_preview', error, 'displaying final selection');
    });
  }

  displayPreview() {
    if (this.deviceStream) {
      this.video.srcObject = this.deviceStream;
    }
  }

  supportWarning() {
    const { intl } = this.props;

    return (
      <div>
        <div className={styles.warning}>!</div>
        <h4 className={styles.main}>{intl.formatMessage(intlMessages.iOSError)}</h4>
        <div className={styles.text}>{intl.formatMessage(intlMessages.iOSErrorDescription)}</div>
        <div className={styles.text}>
          {intl.formatMessage(intlMessages.iOSErrorRecommendation)}
        </div>
      </div>
    );
  }

  renderDeviceSelectors() {
    const {
      intl,
      sharedDevices,
    } = this.props;

    const {
      webcamDeviceId,
      availableWebcams,
      availableProfiles,
      selectedProfile,
    } = this.state;

    const shared = sharedDevices.includes(webcamDeviceId);

    return (
      <div className={styles.col}>
        <label className={styles.label} htmlFor="setCam">
          {intl.formatMessage(intlMessages.cameraLabel)}
        </label>
        { availableWebcams && availableWebcams.length > 0
          ? (
            <select
              id="setCam"
              value={webcamDeviceId || ''}
              className={styles.select}
              onChange={this.handleSelectWebcam}
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
          )
        }
        { shared
          ? (
            <span className={styles.label}>
              {intl.formatMessage(intlMessages.sharedCameraLabel)}
            </span>
          )
          : (
            <span>
              <label className={styles.label} htmlFor="setQuality">
                {intl.formatMessage(intlMessages.qualityLabel)}
              </label>
              {availableProfiles && availableProfiles.length > 0
                ? (
                  <select
                    id="setQuality"
                    value={selectedProfile || ''}
                    className={styles.select}
                    onChange={this.handleSelectProfile}
                  >
                    {availableProfiles.map((profile) => {
                      const label = intlMessages[`${profile.id}`]
                        ? intl.formatMessage(intlMessages[`${profile.id}`])
                        : profile.name;

                      return (
                        <option key={profile.id} value={profile.id}>
                          {`${label}`}
                        </option>
                      );
                    })}
                  </select>
                )
                : (
                  <span>
                    {intl.formatMessage(intlMessages.profileNotFoundLabel)}
                  </span>
                )
              }
            </span>
          )
        }
      </div>
    );
  }

  renderContent() {
    const {
      intl,
    } = this.props;

    const {
      viewState,
      deviceError,
      previewError,
    } = this.state;

    switch (viewState) {
      case VIEW_STATES.finding:
        return (
          <div className={styles.content}>
            <div className={styles.videoCol}>
              <div>
                <span>{intl.formatMessage(intlMessages.findingWebcamsLabel)}</span>
                <span className={styles.fetchingAnimation} />
              </div>
            </div>
          </div>
        );
      case VIEW_STATES.error:
        return (
          <div className={styles.content}>
            <div className={styles.videoCol}><div>{deviceError}</div></div>
          </div>
        );
      case VIEW_STATES.found:
      default:
        return (
          <div className={styles.content}>
            <div className={styles.videoCol}>
              {
                previewError
                  ? (
                    <div>{previewError}</div>
                  )
                  : (
                    <video
                      id="preview"
                      data-test={this.mirrorOwnWebcam ? 'mirroredVideoPreview' : 'videoPreview'}
                      className={cx({
                        [styles.preview]: true,
                        [styles.mirroredVideo]: this.mirrorOwnWebcam,
                      })}
                      ref={(ref) => { this.video = ref; }}
                      autoPlay
                      playsInline
                      muted
                    />
                  )
              }
            </div>
            {this.renderDeviceSelectors()}
          </div>
        );
    }
  }

  renderModalContent() {
    const {
      intl,
      sharedDevices,
      hasVideoStream,
    } = this.props;

    const {
      isStartSharingDisabled,
      webcamDeviceId,
      deviceError,
      previewError,
    } = this.state;
    const shouldDisableButtons = this.skipVideoPreview && !(deviceError || previewError);

    const shared = sharedDevices.includes(webcamDeviceId);

    const { isIe } = browserInfo;

    return (
      <div>
        {isIe ? (
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
        ) : null}
        <div className={styles.title}>
          {intl.formatMessage(intlMessages.webcamSettingsTitle)}
        </div>

        {this.renderContent()}

        <div className={styles.footer}>
          {hasVideoStream
            ? (
              <div className={styles.extraActions}>
                <Button
                  color="danger"
                  label={intl.formatMessage(intlMessages.stopSharingAllLabel)}
                  onClick={this.handleStopSharingAll}
                  disabled={shouldDisableButtons}
                />
              </div>
            )
            : null
          }
          <div className={styles.actions}>
            <Button
              label={intl.formatMessage(intlMessages.cancelLabel)}
              onClick={this.handleProceed}
              disabled={shouldDisableButtons}
            />
            <Button
              data-test="startSharingWebcam"
              color={shared ? 'danger' : 'primary'}
              label={intl.formatMessage(shared ? intlMessages.stopSharingLabel : intlMessages.startSharingLabel)}
              onClick={shared ? this.handleStopSharing : this.handleStartSharing}
              disabled={isStartSharingDisabled || isStartSharingDisabled === null || shouldDisableButtons}
            />
          </div>
        </div>
      </div>
    );
  }

  render() {
    const {
      intl,
      isCamLocked,
    } = this.props;

    if (isCamLocked === true) {
      this.handleProceed();
      return null;
    }

    if (this.skipVideoPreview) {
      return null;
    }

    const {
      deviceError,
      previewError,
    } = this.state;

    const allowCloseModal = !!(deviceError || previewError) || !this.skipVideoPreview;

    return (
      <Modal
        overlayClassName={styles.overlay}
        className={styles.modal}
        onRequestClose={this.handleProceed}
        hideBorder
        contentLabel={intl.formatMessage(intlMessages.webcamSettingsTitle)}
        shouldShowCloseButton={allowCloseModal}
        shouldCloseOnOverlayClick={allowCloseModal}
      >
        {deviceInfo.hasMediaDevices
          ? this.renderModalContent()
          : this.supportWarning()
        }
      </Modal>
    );
  }
}

VideoPreview.propTypes = propTypes;
VideoPreview.defaultProps = defaultProps;

export default injectIntl(VideoPreview);
