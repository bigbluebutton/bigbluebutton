import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  defineMessages, injectIntl, FormattedMessage,
} from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import VirtualBgSelector from '/imports/ui/components/video-preview/virtual-background/component'
import logger from '/imports/startup/client/logger';
import browserInfo from '/imports/utils/browserInfo';
import PreviewService from './service';
import VideoService from '/imports/ui/components/video-provider/service';
import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { notify } from '/imports/ui/services/notification';
import {
  EFFECT_TYPES,
  setSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfo,
  removeSessionVirtualBackgroundInfo,
  isVirtualBackgroundSupported,
  getSessionVirtualBackgroundInfoWithDefault,
} from '/imports/ui/services/virtual-background/service';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import Checkbox from '/imports/ui/components/common/checkbox/component'
import AppService from '/imports/ui/components/app/service';
import { CustomVirtualBackgroundsContext } from '/imports/ui/components/video-preview/virtual-background/context';
import VBGSelectorService from '/imports/ui/components/video-preview/virtual-background/service';
import Storage from '/imports/ui/services/storage/session';
import getFromUserSettings from '/imports/ui/services/users-settings';

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
  camCapReached: PropTypes.bool,
  hasVideoStream: PropTypes.bool.isRequired,
  webcamDeviceId: PropTypes.string,
  sharedDevices: PropTypes.arrayOf(PropTypes.string),
};

const defaultProps = {
  resolve: null,
  camCapReached: true,
  webcamDeviceId: null,
  sharedDevices: [],
};

const intlMessages = defineMessages({
  webcamVirtualBackgroundTitle: {
    id: 'app.videoPreview.webcamVirtualBackgroundLabel',
    description: 'Title for the virtual background modal',
  },
  webcamSettingsTitle: {
    id: 'app.videoPreview.webcamSettingsTitle',
    description: 'Title for the video preview modal',
  },
  closeLabel: {
    id: 'app.videoPreview.closeLabel',
    description: 'Close button label',
  },
  cancelLabel: {
    id: 'app.mobileAppModal.dismissLabel',
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
  camCapReached: {
    id: 'app.video.camCapReached',
    description: 'message for when the camera cap has been reached',
  },
  virtualBgGenericError: {
    id: 'app.video.virtualBackground.genericError',
    description: 'Failed to apply camera effect',
  },
  inactiveError: {
    id: 'app.video.inactiveError',
    description: 'Camera stopped unexpectedly',
  },
  brightness: {
    id: 'app.videoPreview.brightness',
    description: 'Brightness label',
  },
  wholeImageBrightnessLabel: {
    id: 'app.videoPreview.wholeImageBrightnessLabel',
    description: 'Whole image brightness label',
  },
  wholeImageBrightnessDesc: {
    id: 'app.videoPreview.wholeImageBrightnessDesc',
    description: 'Whole image brightness aria description',
  },
  cameraAsContentSettingsTitle: {
    id: 'app.videoPreview.cameraAsContentSettingsTitle',
    description: 'Title for the video preview modal when sharing camera as content',
  },
  sliderDesc: {
    id: 'app.videoPreview.sliderDesc',
    description: 'Brightness slider aria description',
  },
});

class VideoPreview extends Component {
  static contextType = CustomVirtualBackgroundsContext;

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
    this.handleVirtualBgSelected = this.handleVirtualBgSelected.bind(this);
    this.handleLocalStreamInactive = this.handleLocalStreamInactive.bind(this);
    this.handleBrightnessAreaChange = this.handleBrightnessAreaChange.bind(this);
    this.handleSelectTab = this.handleSelectTab.bind(this);

    this._isMounted = false;

    this.state = {
      webcamDeviceId,
      selectedTab: 0,
      availableWebcams: null,
      selectedProfile: null,
      isStartSharingDisabled: true,
      viewState: VIEW_STATES.finding,
      deviceError: null,
      previewError: null,
      brightness: 100,
      wholeImageBrightness: false,
      skipPreviewFailed: false,
    };
  }

  set currentVideoStream (bbbVideoStream) {
    // Stream is being unset - remove gUM revocation handler to avoid false negatives
    if (this._currentVideoStream) {
      this._currentVideoStream.removeListener('inactive', this.handleLocalStreamInactive);
    }
    // Set up inactivation handler for the new stream (to, eg, detect gUM revocation)
    if (bbbVideoStream) {
      bbbVideoStream.once('inactive', this.handleLocalStreamInactive);
    }
    this._currentVideoStream = bbbVideoStream;
  }

  get currentVideoStream () {
    return this._currentVideoStream;
  }

  shouldSkipVideoPreview() {
    const { skipPreviewFailed } = this.state;
    const { forceOpen } = this.props;

    return PreviewService.getSkipVideoPreview() && !forceOpen && !skipPreviewFailed;
  }

  componentDidMount() {
    const {
      webcamDeviceId,
      forceOpen,
    } = this.props;

    this._isMounted = true;

    if (deviceInfo.hasMediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(async (devices) => {
        VideoService.updateNumberOfDevices(devices);
        // Tries to skip video preview - this can happen if:
        // 1. skipVideoPreview, skipVideoPreviewOnFirstJoin, or
        //  skipVideoPreviewIfPreviousDevice flags are enabled and meet their
        //  own conditions
        // 2. forceOpen flag was not specified to this component
        //
        // This will fail if no skip conditions are met, or if an unexpected
        // failure occurs during the process. In that case, the error will be
        // handled and the component will display the default video preview UI
        if (this.shouldSkipVideoPreview()) {
          try {
            await this.skipVideoPreview()
            return;
          } catch (error) {
            logger.warn({
              logCode: 'video_preview_skip_failure',
              extraInfo: {
                errorName: error.name,
                errorMessage: error.message,
              },
            }, 'Skipping video preview failed');
          }
        }
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
          await this.getInitialCameraStream(webcams[0].deviceId);
          // Late gUM resolve, stop.
          if (!this._isMounted) return;

          if (!areLabelled || !areIdentified) {
            // If they aren't labelled or have nullish deviceIds, run
            // enumeration again and get their full versions
            // Why: fingerprinting countermeasures obfuscate those when
            // no permission was granted via gUM
            try {
              const newDevices = await navigator.mediaDevices.enumerateDevices();
              webcams = PreviewService.digestVideoDevices(newDevices, webcamDeviceId).webcams;
            } catch (error) {
              // Not a critical error beucase it should only affect UI; log it
              // and go ahead
              logger.error({
                logCode: 'video_preview_enumerate_relabel_failure',
                extraInfo: {
                  errorName: error.name, errorMessage: error.message,
                },
              }, 'enumerateDevices for relabelling failed');
            }
          }

          this.setState({
            availableWebcams: webcams,
            viewState: VIEW_STATES.found,
          });
          this.displayPreview();
        } else {
          // There were no webcams coming from enumerateDevices. Throw an error.
          const noWebcamsError = new Error('NotFoundError');
          this.handleDeviceError('enumerate', noWebcamsError, ': no webcams found');
        }
      }).catch((error) => {
        // enumerateDevices failed
        this.handleDeviceError('enumerate', error, 'enumerating devices');
      });
    } else {
      // Top-level navigator.mediaDevices is not supported.
      // The session went through the version checking, but somehow ended here.
      // Nothing we can do.
      const error = new Error('NotSupportedError');
      this.handleDeviceError('mount', error, ': navigator.mediaDevices unavailable');
    }
  }

  componentDidUpdate() {
    const { viewState } = this.state;

    if (viewState === VIEW_STATES.found && !this.video.srcObject) {
      this.displayPreview();
    }

    if (this.brightnessMarker) {
      const markerStyle = window.getComputedStyle(this.brightnessMarker);
      const left = parseFloat(markerStyle.left);
      const right = parseFloat(markerStyle.right);

      if (left < 0) {
        this.brightnessMarker.style.left = '0px';
        this.brightnessMarker.style.right = 'auto';
      } else if (right < 0) {
        this.brightnessMarker.style.right = '0px';
        this.brightnessMarker.style.left = 'auto';
      }
    }
  }

  componentWillUnmount() {
    const { webcamDeviceId } = this.state;
    this.terminateCameraStream(this.currentVideoStream, webcamDeviceId);
    this.cleanupStreamAndVideo();
    this._isMounted = false;
  }

  async startCameraBrightness() {
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (CAMERA_BRIGHTNESS_AVAILABLE && this.currentVideoStream) {
      const setBrightnessInfo = () => {
        const stream = this.currentVideoStream || {};
        const service = stream.virtualBgService || {};
        const { brightness = 100, wholeImageBrightness = false } = service;
        this.setState({ brightness, wholeImageBrightness });
      };

      if (!this.currentVideoStream.virtualBgService) {
        const switched = await this.startVirtualBackground(
          this.currentVideoStream,
          EFFECT_TYPES.NONE_TYPE,
        );
        if (switched) setBrightnessInfo();
      } else {
        setBrightnessInfo();
      }
    }
  }

  async setCameraBrightness(brightness) {
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (CAMERA_BRIGHTNESS_AVAILABLE && this.currentVideoStream) {
      if (this.currentVideoStream?.virtualBgService == null) {
        await this.startCameraBrightness();
      }

      this.currentVideoStream.changeCameraBrightness(brightness);
      this.setState({ brightness });
    }
  }

  handleSelectWebcam(event) {
    const webcamValue = event.target.value;

    this.getInitialCameraStream(webcamValue).then(() => {
      this.displayPreview();
    });
  }

  handleLocalStreamInactive({ id }) {
    // id === MediaStream.id
    if (this.currentVideoStream
      && typeof id === 'string'
      && this.currentVideoStream?.mediaStream?.id === id) {
      this.setState({
        isStartSharingDisabled: true,
      });
      this.handlePreviewError(
        'stream_inactive',
        new Error('inactiveError'),
        '- preview camera stream inactive',
      );
    }
  }

  updateVirtualBackgroundInfo () {
    const { webcamDeviceId } = this.state;

    if (this.currentVideoStream) {
      setSessionVirtualBackgroundInfo(
        webcamDeviceId,
        this.currentVideoStream.virtualBgType,
        this.currentVideoStream.virtualBgName,
        this.currentVideoStream.virtualBgUniqueId,
      );
    }
  };

  // Resolves into true if the background switch is successful, false otherwise
  handleVirtualBgSelected(type, name, customParams) {
    const { sharedDevices } = this.props;
    const { webcamDeviceId, brightness } = this.state;
    const shared = this.isAlreadyShared(webcamDeviceId);

    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (type !== EFFECT_TYPES.NONE_TYPE || CAMERA_BRIGHTNESS_AVAILABLE && brightness !== 100) {
      return this.startVirtualBackground(this.currentVideoStream, type, name, customParams).then((switched) => {
        if (switched) this.updateVirtualBackgroundInfo();
        return switched;
      });
    } else {
      this.stopVirtualBackground(this.currentVideoStream);
      if (shared) this.updateVirtualBackgroundInfo();
      return Promise.resolve(true);
    }
  }

  stopVirtualBackground(bbbVideoStream) {
    if (bbbVideoStream) {
      bbbVideoStream.stopVirtualBackground();
      this.displayPreview();
    }
  }

  startVirtualBackground(bbbVideoStream, type, name, customParams) {
    this.setState({ isStartSharingDisabled: true });

    if (bbbVideoStream == null) return Promise.resolve(false);

    return bbbVideoStream.startVirtualBackground(type, name, customParams).then(() => {
      this.displayPreview();
      return true;
    }).catch(error => {
      this.handleVirtualBgError(error, type, name);
      return false;
    }).finally(() => {
      this.setState({ isStartSharingDisabled: false });
    });
  }

  handleSelectProfile(event) {
    const profileValue = event.target.value;
    const { webcamDeviceId } = this.state;

    const selectedProfile = PreviewService.getCameraProfile(profileValue);
    this.getCameraStream(webcamDeviceId, selectedProfile).then(() => {
      this.displayPreview();
    });
  }

  async handleStartSharing() {
    const {
      resolve,
      startSharing,
      cameraAsContent,
      startSharingCameraAsContent,
    } = this.props;
    const {
      webcamDeviceId,
      selectedProfile,
      brightness,
    } = this.state;

    // Only streams that will be shared should be stored in the service.
    // If the store call returns false, we're duplicating stuff. So clean this one
    // up because it's an impostor.
    if(!PreviewService.storeStream(webcamDeviceId, this.currentVideoStream)) {
      this.currentVideoStream.stop();
    }

    if (
      this.currentVideoStream.virtualBgService
      && brightness === 100
      && this.currentVideoStream.virtualBgType === EFFECT_TYPES.NONE_TYPE
    ) {
      this.stopVirtualBackground(this.currentVideoStream);
    }

    if (!cameraAsContent) {
      // Store selected profile, camera ID and virtual background in the storage
      // for future use
      PreviewService.changeProfile(selectedProfile);
      PreviewService.changeWebcam(webcamDeviceId);
      this.updateVirtualBackgroundInfo();
      this.cleanupStreamAndVideo();
      startSharing(webcamDeviceId);
    } else {
      this.cleanupStreamAndVideo();
      startSharingCameraAsContent(webcamDeviceId);
    }
  }

  handleStopSharing() {
    const { resolve, stopSharing, stopSharingCameraAsContent } = this.props;
    const { webcamDeviceId } = this.state;

    if (this.isCameraAsContentDevice(webcamDeviceId)) {
      stopSharingCameraAsContent();
    } else {
      PreviewService.deleteStream(webcamDeviceId);
      stopSharing(webcamDeviceId);
      this.cleanupStreamAndVideo();
    }
    if (resolve) resolve();
  }

  handleStopSharingAll() {
    const { resolve, stopSharing } = this.props;
    stopSharing();
    if (resolve) resolve();
  }

  handleProceed() {
    const { resolve, closeModal, sharedDevices } = this.props;
    const { webcamDeviceId, brightness } = this.state;
    const shared = sharedDevices.includes(webcamDeviceId);

    if (
      (shared)
      && this.currentVideoStream.virtualBgService
      && brightness === 100
      && this.currentVideoStream.virtualBgType === EFFECT_TYPES.NONE_TYPE
    ) {
      this.stopVirtualBackground(this.currentVideoStream);
    }

    this.terminateCameraStream(this.currentVideoStream, webcamDeviceId);
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

  terminateCameraStream(stream, deviceId) {
    if (stream) {
      // Stream is being destroyed - remove gUM revocation handler to avoid false negatives
      stream.removeListener('inactive', this.handleLocalStreamInactive);
      PreviewService.terminateCameraStream(stream, deviceId);
    }
  }

  cleanupStreamAndVideo() {
    this.currentVideoStream = null;
    if (this.video) this.video.srcObject = null;
  }

  handleVirtualBgError(error, type, name) {
    const { intl } = this.props;
    logger.error({
      logCode: `video_preview_virtualbg_error`,
      extraInfo: {
        errorName: error.name,
        errorMessage: error.message,
        virtualBgType: type,
        virtualBgName: name,
      },
    }, `Failed to toggle virtual background: ${error.message}`);

    notify(intl.formatMessage(intlMessages.virtualBgGenericError), 'error', 'video');
  }

  updateDeviceId (deviceId) {
    let actualDeviceId = deviceId;

    if (!actualDeviceId && this.currentVideoStream) {
      actualDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
        this.currentVideoStream.mediaStream,
        'video',
      );
    }

    this.setState({ webcamDeviceId: actualDeviceId, });
  }

  getInitialCameraStream(deviceId) {
    const { cameraAsContent } = this.props;
    const defaultProfile = !cameraAsContent ? PreviewService.getDefaultProfile() : PreviewService.getCameraAsContentProfile();

    return this.getCameraStream(deviceId, defaultProfile);
  }

  applyStoredVirtualBg(deviceId = null) {
    const webcamDeviceId = deviceId || this.state.webcamDeviceId;

    // Apply the virtual background stored in Local/Session Storage, if any
    // If it fails, remove the stored background.
    return new Promise((resolve, reject) => {
      let customParams;
      const virtualBackground = getSessionVirtualBackgroundInfo(webcamDeviceId);

      if (virtualBackground) {
        const { type, name, uniqueId } = virtualBackground;
        const handleFailure = (error) => {
          this.handleVirtualBgError(error, type, name);
          removeSessionVirtualBackgroundInfo(webcamDeviceId);
          reject(error);
        };
        const applyCustomVirtualBg = (backgrounds) => {
          const background = backgrounds[uniqueId]
            || Object.values(backgrounds).find(bg => bg.uniqueId === uniqueId);

          if (background && background.data) {
            customParams = {
              uniqueId,
              file: background?.data,
            };
          } else {
            handleFailure(new Error('Missing virtual background data'));
            return;
          }

          this.handleVirtualBgSelected(type, name, customParams).then(resolve, handleFailure);
        };

        // If uniqueId is defined, this is a custom background. Fetch the custom
        // params from the context and apply them
        if (uniqueId) {
          if (this.context.backgrounds[uniqueId]) {
            applyCustomVirtualBg(this.context.backgrounds);
          } else if (!this.context.loaded) {
            // Virtual BG context might not be loaded yet (in case this is
            // skipping the video preview). Load it manually.
            VBGSelectorService.load(handleFailure, applyCustomVirtualBg);
          } else {
            handleFailure(new Error('Missing virtual background'));
          }

          return;
        }

        // Built-in background, just apply it.
        this.handleVirtualBgSelected(type, name, customParams).then(resolve, handleFailure);
      } else if (this.context.backgrounds.webcamBackgroundURL) {
        // Apply custom background from JOIN URL parameter automatically
        // only if there's not any session background yet.
        const { filename, data, type, uniqueId } = this.context.backgrounds.webcamBackgroundURL;
        const customParams = {
          file: data,
          uniqueId,
        };

        const handleFailure = (error) => {
          this.handleVirtualBgError(error, type, filename);
          removeSessionVirtualBackgroundInfo(webcamDeviceId);
          reject(error);
        };

        this.handleVirtualBgSelected(type, filename, customParams).then(resolve, handleFailure);
      } else {
        resolve();
      }
    });
  }

  async getCameraStream(deviceId, profile) {
    const { webcamDeviceId } = this.state;
    const { cameraAsContent, forceOpen } = this.props;

    this.setState({
      selectedProfile: profile.id,
      isStartSharingDisabled: true,
      previewError: undefined,
    });

    this.terminateCameraStream(this.currentVideoStream, webcamDeviceId);
    this.cleanupStreamAndVideo();

    try {
      // The return of doGUM is an instance of BBBVideoStream (a thin wrapper over a MediaStream)
      const bbbVideoStream = await PreviewService.doGUM(deviceId, profile);
      this.currentVideoStream = bbbVideoStream;
      this.updateDeviceId(deviceId);
    } catch(error) {
      // When video preview is set to skip, we need some way to bubble errors
      // up to users; so re-throw the error
      if (!this.shouldSkipVideoPreview()) {
        this.handlePreviewError('do_gum_preview', error, 'displaying final selection');
      } else {
        throw error;
      }
    }

    // Restore virtual background if it was stored in Local/Session Storage
    try {
      if (!cameraAsContent) await this.applyStoredVirtualBg(deviceId);
    } catch (error) {
      // Only bubble up errors in this case if we're skipping the video preview
      // This is because virtual background failures are deemed critical when
      // skipping the video preview, but not otherwise
      if (this.shouldSkipVideoPreview()) {
        throw error;
      }
    } finally {
      // Late VBG resolve, clean up tracks, stop.
      if (!this._isMounted) {
        this.terminateCameraStream(bbbVideoStream, deviceId);
        this.cleanupStreamAndVideo();
        return;
      }
      this.setState({
        isStartSharingDisabled: false,
      });
    }
  }

  displayPreview() {
    if (this.currentVideoStream && this.video) {
      this.video.srcObject = this.currentVideoStream.mediaStream;
    }
  }

  skipVideoPreview() {
    const { webcamDeviceId } = this.state;
    const { forceOpen } = this.props;

    return this.getInitialCameraStream(webcamDeviceId).then(() => {
      this.handleStartSharing();
    }).catch(error => {
      PreviewService.clearWebcamDeviceId();
      PreviewService.clearWebcamProfileId();
      removeSessionVirtualBackgroundInfo(webcamDeviceId);
      this.cleanupStreamAndVideo();
      // Mark the skip as failed so that the component will override any option
      // to skip the video preview and display the default UI
      if (this._isMounted) this.setState({ skipPreviewFailed: true });
      throw error;
    });
  }

  supportWarning() {
    const { intl } = this.props;

    return (
      <div>
        <Styled.Warning>!</Styled.Warning>
        <Styled.Main>{intl.formatMessage(intlMessages.iOSError)}</Styled.Main>
        <Styled.Text>{intl.formatMessage(intlMessages.iOSErrorDescription)}</Styled.Text>
        <Styled.Text>
          {intl.formatMessage(intlMessages.iOSErrorRecommendation)}
        </Styled.Text>
      </div>
    );
  }

  getFallbackLabel(webcam, index) {
    const { intl } = this.props;
    return `${intl.formatMessage(intlMessages.cameraLabel)} ${index}`
  }

  isAlreadyShared (webcamId) { 
    const { sharedDevices, cameraAsContentDeviceId } = this.props;

    return sharedDevices.includes(webcamId) || webcamId === cameraAsContentDeviceId;
  }

  isCameraAsContentDevice (deviceId) {
    const { cameraAsContentDeviceId } = this.props;

    return deviceId === cameraAsContentDeviceId;
  }

  renderDeviceSelectors() {
    const {
      intl,
      sharedDevices,
      cameraAsContent,
    } = this.props;

    const {
      webcamDeviceId,
      availableWebcams,
      selectedProfile,
    } = this.state;

    return (
      <Styled.InternCol>
        <Styled.Label htmlFor="setCam">
          {intl.formatMessage(intlMessages.cameraLabel)}
        </Styled.Label>
        { availableWebcams && availableWebcams.length > 0
          ? (
            <Styled.Select
              id="setCam"
              value={webcamDeviceId || ''}
              onChange={this.handleSelectWebcam}
            >
              {availableWebcams.map((webcam, index) => (
                <option key={webcam.deviceId} value={webcam.deviceId}>
                  {webcam.label || this.getFallbackLabel(webcam, index)}
                </option>
              ))}
            </Styled.Select>
          )
          : (
            <span>
              {intl.formatMessage(intlMessages.webcamNotFoundLabel)}
            </span>
          )
        }
        {this.renderQualitySelector()}
      </Styled.InternCol>
    );
  }

  renderQualitySelector() {
    const {
      intl,
      cameraAsContent,
    } = this.props

    const {
      selectedProfile,
      availableWebcams,
      webcamDeviceId, 
    } = this.state;

    const shared = this.isAlreadyShared(webcamDeviceId);

    if (shared) { 
      return (
        <Styled.Label>
          {intl.formatMessage(intlMessages.sharedCameraLabel)}
        </Styled.Label>
      );
    }
    
    if (cameraAsContent) return;

    const CAMERA_PROFILES = window.meetingClientSettings.public.kurento.cameraProfiles || [];
    // Filtered, without hidden profiles
    const PREVIEW_CAMERA_PROFILES = CAMERA_PROFILES.filter(p => !p.hidden);

    return (
      <>
        <Styled.Label htmlFor="setQuality">
          {intl.formatMessage(intlMessages.qualityLabel)}
        </Styled.Label>
        {PREVIEW_CAMERA_PROFILES.length > 0
          ? (
            <Styled.Select
              id="setQuality"
              value={selectedProfile || ''}
              onChange={this.handleSelectProfile}
            >
              {PREVIEW_CAMERA_PROFILES.map((profile) => {
                const label = intlMessages[`${profile.id}`]
                  ? intl.formatMessage(intlMessages[`${profile.id}`])
                  : profile.name;

                return (
                  <option key={profile.id} value={profile.id}>
                    {`${label}`}
                  </option>
                );
              })}
            </Styled.Select>
          )
          : (
            <span>
              {intl.formatMessage(intlMessages.profileNotFoundLabel)}
            </span>
          )
        }
      </>
    );
  }

  async handleBrightnessAreaChange() {
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();
    
    if (CAMERA_BRIGHTNESS_AVAILABLE && this.currentVideoStream) {
      if (this.currentVideoStream?.virtualBgService == null) {
        await this.startCameraBrightness();
      }

      const { wholeImageBrightness } = this.state;
      this.currentVideoStream.toggleCameraBrightnessArea(!wholeImageBrightness);
      this.setState({ wholeImageBrightness: !wholeImageBrightness });
    }
  }

  renderBrightnessInput() {
    const {
      cameraAsContent,
      cameraAsContentDeviceId,
    } = this.props;
    const {
      webcamDeviceId,
    } = this.state;

    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;

    if (!ENABLE_CAMERA_BRIGHTNESS) return null;

    const { intl } = this.props;
    const { brightness, wholeImageBrightness, isStartSharingDisabled } = this.state;
    const shared = this.isAlreadyShared(webcamDeviceId);

    const origin = brightness <= 100 ? 'left' : 'right';
    const offset = origin === 'left'
      ? (brightness * 100) / 200
      : ((200 - brightness) * 100) / 200;

    if(cameraAsContent || webcamDeviceId === cameraAsContentDeviceId){ return null }

    return (
      <Styled.InternCol>
        <Styled.Label htmlFor="brightness">
          {intl.formatMessage(intlMessages.brightness)}
        </Styled.Label>
        <div aria-hidden>
          <Styled.MarkerDynamicWrapper>
            <Styled.MarkerDynamic
              ref={(ref) => this.brightnessMarker = ref}
              style={{ [origin]: `calc(${offset}% - 1rem)` }}
            >
              {brightness - 100}
            </Styled.MarkerDynamic>
          </Styled.MarkerDynamicWrapper>
        </div>
        <input
          id="brightness"
          style={{ width: '100%' }}
          type="range"
          min={0}
          max={200}
          value={brightness}
          aria-describedby={'brightness-slider-desc'}
          onChange={(e) => {
            const brightness = e.target.valueAsNumber;
            this.setCameraBrightness(brightness);
          }}
          disabled={!isVirtualBackgroundSupported() || isStartSharingDisabled}
        />
        <div style={{ display: 'none' }} id={'brightness-slider-desc'}>
          {intl.formatMessage(intlMessages.sliderDesc)}
        </div>
        <Styled.MarkerWrapper aria-hidden>
          <Styled.Marker>{'-100'}</Styled.Marker>
          <Styled.Marker>{'0'}</Styled.Marker>
          <Styled.Marker>{'100'}</Styled.Marker>
        </Styled.MarkerWrapper>
        <div style={{ display: 'flex', marginTop: '.5rem' }}>
          <Checkbox
            onChange={this.handleBrightnessAreaChange}
            checked={wholeImageBrightness}
            ariaLabel={intl.formatMessage(intlMessages.wholeImageBrightnessLabel)}
            ariaDescribedBy={'whole-image-desc'}
            ariaDesc={intl.formatMessage(intlMessages.wholeImageBrightnessDesc)}
            disabled={!isVirtualBackgroundSupported() || isStartSharingDisabled}
            label={intl.formatMessage(intlMessages.wholeImageBrightnessLabel)}
          />
        </div>
      </Styled.InternCol>
    );
  }

  renderVirtualBgSelector() {
    const { isCustomVirtualBackgroundsEnabled } = this.props;
    const { isStartSharingDisabled, webcamDeviceId } = this.state;
    const initialVirtualBgState = this.currentVideoStream ? {
      type: this.currentVideoStream.virtualBgType,
      name: this.currentVideoStream.virtualBgName,
      uniqueId: this.currentVideoStream.virtualBgUniqueId,
    } : getSessionVirtualBackgroundInfoWithDefault(webcamDeviceId);

    const {
      showThumbnails: SHOW_THUMBNAILS = true,
    } = window.meetingClientSettings.public.virtualBackgrounds;
    
    return (
      <VirtualBgSelector
        handleVirtualBgSelected={this.handleVirtualBgSelected}
        locked={isStartSharingDisabled}
        showThumbnails={SHOW_THUMBNAILS}
        initialVirtualBgState={initialVirtualBgState}
        isCustomVirtualBackgroundsEnabled={isCustomVirtualBackgroundsEnabled}
      />
    );
  }

  renderTabsContent(tabNumber) {
    const {
      cameraAsContent,
      isVirtualBackgroundsEnabled,
    } = this.props;
  
    const shouldShowVirtualBackgrounds = isVirtualBackgroundsEnabled && !cameraAsContent;
  
    return (
      <Styled.ContentCol>
        {tabNumber === 0 && (
          <Styled.Col>
            {this.renderDeviceSelectors()}
            {isVirtualBackgroundSupported() && this.renderBrightnessInput()}
          </Styled.Col>
        )}
        {tabNumber === 1 && shouldShowVirtualBackgrounds && (
          <Styled.BgnCol>
            {this.renderVirtualBgSelector()}
          </Styled.BgnCol>
        )}
      </Styled.ContentCol>
    );
  }

  renderContent(selectedTab) {
    const {
      intl,
    } = this.props;

    const {
      viewState,
      deviceError,
      previewError,
    } = this.state;

    const Settings = getSettingsSingletonInstance();
    const { animations } = Settings.application;

    const containerStyle = {
      width: '60%',
      height: '25vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center', 
    };

    switch (viewState) {
      case VIEW_STATES.finding:
        return (
          <Styled.Content>
            <Styled.VideoCol>
              <div style={containerStyle}>
                <span>{intl.formatMessage(intlMessages.findingWebcamsLabel)}</span>
                <Styled.FetchingAnimation animations={animations} />
              </div>
            </Styled.VideoCol>
          </Styled.Content>
        );
      case VIEW_STATES.error:
        return (
          <Styled.Content>
            <Styled.VideoCol><div>{deviceError}</div></Styled.VideoCol>
          </Styled.Content>
        );
      case VIEW_STATES.found:
      default:
        return (
          <Styled.Content>
            <Styled.VideoCol>
              {
                previewError
                  ? (
                    <div>{previewError}</div>
                  )
                  : (
                    <Styled.VideoPreview
                      mirroredVideo={VideoService.mirrorOwnWebcam()}
                      id="preview"
                      data-test={VideoService.mirrorOwnWebcam() ? 'mirroredVideoPreview' : 'videoPreview'}
                      ref={(ref) => { this.video = ref; }}
                      autoPlay
                      playsInline
                      muted
                    />
                  )
              }
            </Styled.VideoCol>
            {this.renderTabsContent(selectedTab)}
          </Styled.Content>
        );
    }
  }

  getModalTitle() {
    const { intl, cameraAsContent } = this.props;
    if (cameraAsContent) return intl.formatMessage(intlMessages.cameraAsContentSettingsTitle);
    return intl.formatMessage(intlMessages.webcamSettingsTitle);
  }

  renderModalContent(selectedTab) {
    const {
      intl,
      hasVideoStream,
      forceOpen,
      camCapReached,
      closeModal,
    } = this.props;

    const {
      isStartSharingDisabled,
      webcamDeviceId,
      deviceError,
      previewError,
    } = this.state;
    const shouldDisableButtons = this.shouldSkipVideoPreview()
      && !(deviceError || previewError);

    const shared = this.isAlreadyShared(webcamDeviceId);

    const showStopAllButton = hasVideoStream && VideoService.isMultipleCamerasEnabled();

    const { isIe } = browserInfo;

    return (
      <>
        {isIe ? (
          <Styled.BrowserWarning>
            <FormattedMessage
              id="app.audioModal.unsupportedBrowserLabel"
              description="Warning when someone joins with a browser that isn't supported"
              values={{
                0: <a href="https://www.google.com/chrome/">Chrome</a>,
                1: <a href="https://getfirefox.com">Firefox</a>,
              }}
            />
          </Styled.BrowserWarning>
        ) : null}

        {this.renderContent(selectedTab)}

        <Styled.Footer>
          <Styled.BottomSeparator />
            <Styled.FooterContainer>
              {showStopAllButton ? (
                <Styled.ExtraActions>
                  <Styled.StopAllButton
                    color="danger"
                    label={intl.formatMessage(intlMessages.stopSharingAllLabel)}
                    onClick={this.handleStopSharingAll}
                    disabled={shouldDisableButtons}
                  />
                </Styled.ExtraActions>
              ) : null}
                {!shared && camCapReached ? (
                  <span>{intl.formatMessage(intlMessages.camCapReached)}</span>
                ) : (
                  <div style={{ display: 'flex' }}>
                      <Styled.CancelButton
                        data-test="cancelSharingWebcam"
                        label={intl.formatMessage(intlMessages.cancelLabel)}
                        onClick={closeModal}
                      />
                      <Styled.SharingButton
                        data-test="startSharingWebcam"
                        color={shared ? 'danger' : 'primary'}
                        label={intl.formatMessage(shared ? intlMessages.stopSharingLabel : intlMessages.startSharingLabel)}
                        onClick={shared ? this.handleStopSharing : this.handleStartSharing}
                        disabled={isStartSharingDisabled || isStartSharingDisabled === null || shouldDisableButtons}
                      />
                  </div>
                )}

            </Styled.FooterContainer>
        </Styled.Footer>
      </>
    );
  }

  handleSelectTab(tab) {
    this.setState({
      selectedTab: tab,
    });
  }

  render() {
    const {
      intl,
      isCamLocked,
      forceOpen,
      isOpen,
      priority,
      cameraAsContent,
      cameraAsContentDeviceId,
      isVirtualBackgroundsEnabled,
    } = this.props;

    const { selectedTab, webcamDeviceId } = this.state;
    
    const BASE_NAME = window.meetingClientSettings.public.app.basename;
    const WebcamSettingsImg = `${BASE_NAME}/resources/images/webcam_settings.svg`;
    const WebcamBackgroundImg = `${BASE_NAME}/resources/images/webcam_background.svg`;

    const darkThemeState = AppService.isDarkThemeEnabled();
    const isBlurred = Storage.getItem('isFirstJoin') !== false 
    && getFromUserSettings('bbb_auto_share_webcam', window.meetingClientSettings.public.kurento.autoShareWebcam);

    if (isCamLocked === true) {
      this.handleProceed();
      return null;
    }

    if (this.shouldSkipVideoPreview()) {
      return null;
    }

    const {
      deviceError,
      previewError,
    } = this.state;

    const allowCloseModal = !!(deviceError || previewError)
    || !PreviewService.getSkipVideoPreview()
    || forceOpen;

    const shouldShowVirtualBackgroundsTab = isVirtualBackgroundsEnabled 
    && !cameraAsContent
    && !(webcamDeviceId === cameraAsContentDeviceId)
    && isVirtualBackgroundSupported()

    return (
      <Styled.Background isBlurred={isBlurred}>
        <Styled.VideoPreviewModal
          onRequestClose={this.handleProceed}
          contentLabel={intl.formatMessage(intlMessages.webcamSettingsTitle)}
          shouldShowCloseButton={allowCloseModal}
          shouldCloseOnOverlayClick={allowCloseModal}
          isPhone={deviceInfo.isPhone}
          data-test="webcamSettingsModal"
          {...{
            isOpen,
            priority,
          }}
        >
          <Styled.Container>
            <Styled.Header>
              <Styled.WebcamTabs
              onSelect={this.handleSelectTab}
              selectedIndex={selectedTab}
              >
                <Styled.WebcamTabList>
                  <Styled.WebcamTabSelector selectedClassName="is-selected">
                    <Styled.IconSvg
                      src={WebcamSettingsImg}
                      darkThemeState={darkThemeState}
                    />
                    <span 
                      id="webcam-settings-title">{this.getModalTitle()}
                    </span>
                  </Styled.WebcamTabSelector>
                  {shouldShowVirtualBackgroundsTab && (
                  <>
                    <Styled.HeaderSeparator />
                    <Styled.WebcamTabSelector selectedClassName="is-selected">
                      <Styled.IconSvg
                        src={WebcamBackgroundImg}
                        darkThemeState={darkThemeState}
                      />
                      <span id="backgrounds-title">{intl.formatMessage(intlMessages.webcamVirtualBackgroundTitle)}</span>
                    </Styled.WebcamTabSelector>
                  </>
                )}
                </Styled.WebcamTabList>
                
              </Styled.WebcamTabs>
            </Styled.Header>

            {deviceInfo.hasMediaDevices
                ? this.renderModalContent(selectedTab)
                : this.supportWarning()
              }

          </Styled.Container>
        </Styled.VideoPreviewModal>
      </Styled.Background>
    );
  }
}

VideoPreview.propTypes = propTypes;
VideoPreview.defaultProps = defaultProps;

export default injectIntl(VideoPreview);
