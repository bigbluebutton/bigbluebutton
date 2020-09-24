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
import VideoService from '../video-provider/service';
import cx from 'classnames';
import { styles } from './styles';

const CAMERA_PROFILES = Meteor.settings.public.kurento.cameraProfiles;

const VIEW_STATES = {
  finding: 'finding',
  found: 'found',
  error: 'error',
};

const propTypes = {
  intl: intlShape.isRequired,
  closeModal: PropTypes.func.isRequired,
  startSharing: PropTypes.func.isRequired,
  stopSharing: PropTypes.func.isRequired,
  changeWebcam: PropTypes.func.isRequired,
  changeProfile: PropTypes.func.isRequired,
  resolve: PropTypes.func,
  skipVideoPreview: PropTypes.bool.isRequired,
  hasMediaDevices: PropTypes.bool.isRequired,
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
});

class VideoPreview extends Component {
  static handleGUMError(error) {
    // logger.error(error);
    // logger.error(error.id);
    // logger.error(error.name);
    // console.log(error);
    // console.log(error.name)
    // console.log(error.message)

    // let convertedError;

    /* switch (error.name) {
      case 'SourceUnavailableError':
      case 'NotReadableError':
        // hardware failure with the device
        // NotReadableError: Could not start video source
        break;
      case 'NotAllowedError':
        // media was disallowed
        // NotAllowedError: Permission denied
        convertedError = intlMessages.NotAllowedError;
        break;
      case 'AbortError':
        // generic error occured
        // AbortError: Starting video failed (FF when there's a hardware failure)
        break;
      case 'NotFoundError':
        // no webcam found
        // NotFoundError: The object can not be found here.
        // NotFoundError: Requested device not found
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
    } */

    return `${error.name}: ${error.message}`;
  }

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

    this.mirrorOwnWebcam = VideoService.mirrorOwnWebcam();
    this.userParameterProfile = VideoService.getUserParameterProfile();
  }

  componentDidMount() {
    const {
      webcamDeviceId,
      hasMediaDevices,
      skipVideoPreview,
    } = this.props;

    this._isMounted = true;

    // Have to request any device to get past checks before finding devices. If this is
    // skipped then we get devices with no labels
    if (hasMediaDevices) {
      try {
        navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: 'user' } })
          .then((stream) => {
            if (!this._isMounted) return;
            this.deviceStream = stream;
            // try and get the deviceId for the initial stream
            let firstAllowedDeviceId;
            if (stream.getVideoTracks) {
              const videoTracks = stream.getVideoTracks();
              if (videoTracks.length > 0 && videoTracks[0].getSettings) {
                const trackSettings = videoTracks[0].getSettings();
                firstAllowedDeviceId = trackSettings.deviceId;
              }
            }

            navigator.mediaDevices.enumerateDevices().then((devices) => {
              const webcams = [];
              let initialDeviceId;

              VideoService.updateNumberOfDevices(devices);

              if (!this._isMounted) return;

              // set webcam
              devices.forEach((device) => {
                // Avoid duplicated devices
                const found = webcams.find(d => d.deviceId === device.deviceId);
                if (device.kind === 'videoinput' && !found) {
                  webcams.push(device);
                  if (!initialDeviceId
                  || (webcamDeviceId && webcamDeviceId === device.deviceId)
                  || device.deviceId === firstAllowedDeviceId) {
                    initialDeviceId = device.deviceId;
                  }
                }
              });

              logger.debug({
                logCode: 'video_preview_enumerate_devices',
                extraInfo: {
                  devices,
                  webcams,
                },
              }, `Enumerate devices came back. There are ${devices.length} devices and ${webcams.length} are video inputs`);


              if (initialDeviceId) {
                this.setState({
                  availableWebcams: webcams,
                });
                this.displayInitialPreview(initialDeviceId);
              }
              if (!skipVideoPreview) {
                this.setState({
                  viewState: VIEW_STATES.found,
                });
              }
            }).catch((error) => {
              logger.warn({
                logCode: 'video_preview_enumerate_error',
                extraInfo: {
                  errorName: error.name,
                  errorMessage: error.message,
                },
              }, 'Error enumerating devices');
              this.setState({
                viewState: VIEW_STATES.error,
                deviceError: VideoPreview.handleGUMError(error),
              });
            });
          }).catch((error) => {
            logger.warn({
              logCode: 'video_preview_initial_device_error',
              extraInfo: {
                errorName: error.name,
                errorMessage: error.message,
              },
            }, 'Error getting initial device');
            this.setState({
              viewState: VIEW_STATES.error,
              deviceError: VideoPreview.handleGUMError(error),
            });
          });
      } catch (error) {
        logger.warn({
          logCode: 'video_preview_grabbing_error',
          extraInfo: {
            errorName: error.name,
            errorMessage: error.message,
          },
        }, 'Error grabbing initial video stream');
        this.setState({
          viewState: VIEW_STATES.error,
          deviceError: VideoPreview.handleGUMError(error),
        });
      }
    } else {
      // TODO: Add an error message when media is globablly disabled
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

  handleSelectWebcam(event) {
    const webcamValue = event.target.value;

    this.displayInitialPreview(webcamValue);
  }

  handleSelectProfile(event) {
    const profileValue = event.target.value;
    const { webcamDeviceId } = this.state;

    const selectedProfile = CAMERA_PROFILES.find(profile => profile.id === profileValue);

    this.displayPreview(webcamDeviceId, selectedProfile);
  }

  handleStartSharing() {
    const { resolve, startSharing } = this.props;
    const { webcamDeviceId } = this.state;
    this.stopTracks();
    startSharing(webcamDeviceId);
    if (resolve) resolve();
  }

  handleStopSharing() {
    const { resolve, stopSharing } = this.props;
    const { webcamDeviceId } = this.state;
    this.stopTracks();
    stopSharing(webcamDeviceId);
    if (resolve) resolve();
  }

  handleStopSharingAll() {
    const { resolve, stopSharing } = this.props;
    this.stopTracks();
    stopSharing();
    if (resolve) resolve();
  }

  handleProceed() {
    const { resolve, closeModal } = this.props;
    this.stopTracks();
    closeModal();
    if (resolve) resolve();
  }

  displayInitialPreview(deviceId) {
    const { changeWebcam } = this.props;
    const availableProfiles = CAMERA_PROFILES.filter(p => !p.hidden);

    this.setState({
      webcamDeviceId: deviceId,
      isStartSharingDisabled: true,
      availableProfiles,
    });
    changeWebcam(deviceId);

    if (availableProfiles.length > 0) {
      const defaultProfile = availableProfiles.find(profile => profile.id === this.userParameterProfile)
        || availableProfiles.find(profile => profile.default)
        || availableProfiles[0];
      this.displayPreview(deviceId, defaultProfile);
    }
  }

  doGUM(deviceId, profile) {
    const constraints = {
      audio: false,
      video: { ...profile.constraints },
    };
    constraints.video.deviceId = { exact: deviceId };

    this.stopTracks();
    if (this.video) {
      this.video.srcObject = null;
    }
    this.deviceStream = null;

    return navigator.mediaDevices.getUserMedia(constraints);
  }

  displayPreview(deviceId, profile) {
    const {
      changeProfile,
      skipVideoPreview,
    } = this.props;

    this.setState({
      selectedProfile: profile.id,
      isStartSharingDisabled: true,
      previewError: undefined,
    });
    changeProfile(profile.id);
    if (skipVideoPreview) return this.handleStartSharing();

    this.doGUM(deviceId, profile).then((stream) => {
      if (!this._isMounted) return;

      this.setState({
        isStartSharingDisabled: false,
      });
      this.video.srcObject = stream;
      this.deviceStream = stream;
    }).catch((error) => {
      logger.warn({
        logCode: 'video_preview_do_gum_preview_error',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, 'Error displaying final selection.');
      this.setState({ previewError: VideoPreview.handleGUMError(error) });
    });
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
      skipVideoPreview,
      sharedDevices
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
              disabled={skipVideoPreview}
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
               { availableProfiles && availableProfiles.length > 0
                 ? (
                   <select
                     id="setQuality"
                     value={selectedProfile || ''}
                     className={styles.select}
                     onChange={this.handleSelectProfile}
                     disabled={skipVideoPreview}
                   >
                     {availableProfiles.map(profile => { 
                      const label = intlMessages[`${profile.id}`] 
                        ? intl.formatMessage(intlMessages[`${profile.id}`])
                        : profile.name;

                      return (
                       <option key={profile.id} value={profile.id}>
                          {`${label}`}
                       </option>
                     )})}
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
      skipVideoPreview,
      sharedDevices,
      hasVideoStream,
    } = this.props;

    const {
      isStartSharingDisabled,
      webcamDeviceId,
      deviceError,
      previewError,
    } = this.state;
    const shouldDisableButtons = skipVideoPreview && !(deviceError || previewError);

    const shared = sharedDevices.includes(webcamDeviceId);

    return (
      <div>
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
        ) : null}
        <div className={styles.title}>
          {intl.formatMessage(intlMessages.webcamSettingsTitle)}
        </div>

        {this.renderContent()}

        <div className={styles.footer}>
          {hasVideoStream ?
            (<div className={styles.extraActions}>
              <Button
                color="danger"
                label={intl.formatMessage(intlMessages.stopSharingAllLabel)}
                onClick={this.handleStopSharingAll}
                disabled={shouldDisableButtons}
              />
            </div>)
            : null
          }
          <div className={styles.actions}>
            <Button
              label={intl.formatMessage(intlMessages.cancelLabel)}
              onClick={this.handleProceed}
              disabled={shouldDisableButtons}
            />
            <Button
              color={shared ? "danger" : "primary"}
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
      hasMediaDevices,
      skipVideoPreview,
      isCamLocked,
    } = this.props;

    if (isCamLocked === true) {
      this.handleProceed();
      return null;
    }

    const {
      deviceError,
      previewError,
    } = this.state;

    const allowCloseModal = !!(deviceError || previewError) || !skipVideoPreview;

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
        {hasMediaDevices
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
