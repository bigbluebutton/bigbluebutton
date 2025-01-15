import PropTypes from 'prop-types';
import React, { Component } from 'react';
import {
  defineMessages, injectIntl, FormattedMessage,
} from 'react-intl';
import Button from '/imports/ui/components/common/button/component';
import VirtualBgSelector from '/imports/ui/components/video-preview/virtual-background/component';
import VirtualBgService from '/imports/ui/components/video-preview/virtual-background/service';
import logger from '/imports/startup/client/logger';
import browserInfo from '/imports/utils/browserInfo';
import PreviewService from './service';
import VideoService from '../video-provider/service';
import Styled from './styles';
import deviceInfo from '/imports/utils/deviceInfo';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { notify } from '/imports/ui/services/notification';
import {
  EFFECT_TYPES,
  SHOW_THUMBNAILS,
  setSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfo,
  isVirtualBackgroundSupported,
  clearSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfoWithDefault,
} from '/imports/ui/services/virtual-background/service';
import Settings from '/imports/ui/services/settings';
import { isVirtualBackgroundsEnabled } from '/imports/ui/services/features';
import Checkbox from '/imports/ui/components/common/checkbox/component';
import { CustomVirtualBackgroundsContext } from '/imports/ui/components/video-preview/virtual-background/context';
import Auth from '/imports/ui/services/auth';
import Users from '/imports/api/users';

const VIEW_STATES = {
  finding: 'finding',
  found: 'found',
  error: 'error',
};

const ENABLE_CAMERA_BRIGHTNESS = Meteor.settings.public.app.enableCameraBrightness;
const SKIP_INITIAL_ENUM = Meteor.settings.public.media.skipInitialCamEnumeration;
const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  startSharing: PropTypes.func.isRequired,
  stopSharing: PropTypes.func.isRequired,
  resolve: PropTypes.func,
  camCapReached: PropTypes.bool,
  hasVideoStream: PropTypes.bool.isRequired,
  webcamDeviceId: PropTypes.string,
  sharedDevices: PropTypes.arrayOf(PropTypes.string),
  cameraAsContent: PropTypes.bool,
};

const defaultProps = {
  resolve: null,
  camCapReached: true,
  webcamDeviceId: null,
  sharedDevices: [],
  cameraAsContent: false,
};

const intlMessages = defineMessages({
  webcamEffectsTitle: {
    id: 'app.videoPreview.webcamEffectsTitle',
    description: 'Title for the video effects modal',
  },
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
    this.updateVirtualBackgroundInfo = this.updateVirtualBackgroundInfo.bind(this);

    this._isMounted = false;

    this.state = {
      webcamDeviceId,
      availableWebcams: null,
      selectedProfile: null,
      isStartSharingDisabled: true,
      viewState: VIEW_STATES.finding,
      deviceError: null,
      previewError: null,
      brightness: 100,
      wholeImageBrightness: false,
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

  componentDidMount() {
    const {
      webcamDeviceId,
      forceOpen,
    } = this.props;
    const { dispatch, backgrounds } = this.context;

    this._isMounted = true;

    // Set the custom or default virtual background
    const webcamBackground = Users.findOne({
      meetingId: Auth.meetingID,
      userId: Auth.userID,
    }, {
      fields: {
        webcamBackground: 1,
      },
    });

    const webcamBackgroundURL = webcamBackground?.webcamBackground;
    if (webcamBackgroundURL !== '' && !backgrounds.webcamBackgroundURL) {
      VirtualBgService.getFileFromUrl(webcamBackgroundURL).then((fetchedWebcamBackground) => {
        if (fetchedWebcamBackground) {
          const data = URL.createObjectURL(fetchedWebcamBackground);
          const uniqueId = 'webcamBackgroundURL';
          const filename = webcamBackgroundURL;
          dispatch({
            type: 'update',
            background: {
              filename,
              uniqueId,
              data,
              lastActivityDate: Date.now(),
              custom: true,
              sessionOnly: true,
            },
          });
        } else {
          logger.error('Failed to fetch custom webcam background image. Using fallback image.');
        }
      });
    }

    const populatePreview = ({
      digestedWebcams = [],
      devices,
      areLabelled,
      areIdentified,
    } = { }) => {
      if (devices) VideoService.updateNumberOfDevices(devices);
      // Video preview skip is activated, short circuit via a simpler procedure
      if (PreviewService.getSkipVideoPreview() && !forceOpen) {
        this.skipVideoPreview();
        return;
      }
      // Late enumerateDevices resolution, stop.
      if (!this._isMounted) return;

      let processedCamerasList = digestedWebcams;
      const initialDeviceId = processedCamerasList[0]?.deviceId || webcamDeviceId;

      this.getInitialCameraStream(initialDeviceId)
        .then(async () => {
          // Late gUM resolve, stop.
          if (!this._isMounted) return;

          if (!areLabelled || !areIdentified) {
            // If they aren't labelled or have nullish deviceIds, run
            // enumeration again and get their full versions
            // Why: fingerprinting countermeasures obfuscate those when
            // no permission was granted via gUM
            try {
              const {
                devices: newDevices,
                digestedWebcams: newDigestedWebcams,
              } = await PreviewService.doEnumerateDevices({ priorityDeviceId: webcamDeviceId });
              processedCamerasList = newDigestedWebcams;
              VideoService.updateNumberOfDevices(newDevices);
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

          if (processedCamerasList.length > 0) {
            this.setState({
              availableWebcams: processedCamerasList,
              viewState: VIEW_STATES.found,
            });
            this.displayPreview();
          } else {
            // There were no webcams coming from enumerateDevices. Throw an error.
            const noWebcamsError = new Error('NotFoundError');
            this.handleDeviceError('enumerate', noWebcamsError, ': no webcams found');
          }
        });
    };

    if (deviceInfo.hasMediaDevices) {
      if (SKIP_INITIAL_ENUM) {
        populatePreview({
          digestedWebcams: [],
          devices: [],
          areLabelled: false,
          areIdentified: false,
        });
      } else {
        PreviewService.doEnumerateDevices({ priorityDeviceId: webcamDeviceId })
          .then(populatePreview)
          .catch((error) => {
            // Late enumerateDevices rejection, stop.
            logger.error({
              logCode: 'video_preview_enumerate_failure',
              extraInfo: {
                errorName: error.name,
                errorMessage: error.message,
                errorStack: error.stack,
              },
            }, 'video-preview: enumerateDevices failed');
            // Try populating the preview anyways after an initial gUM is run.
            populatePreview();
          });
      }
    } else {
      // Top-level navigator.mediaDevices is not supported.
      // The session went through the version checking, but somehow ended here.
      // Nothing we can do.
      const error = new Error('NotSupportedError');
      this.handleDeviceError('mount', error, ': navigator.mediaDevices unavailable');
    }
  }

  componentDidUpdate() {
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

  // Resolves into true if the background switch is successful, false otherwise
  handleVirtualBgSelected(type, name, customParams) {
    if (type !== EFFECT_TYPES.NONE_TYPE || CAMERA_BRIGHTNESS_AVAILABLE) {
      return this.startVirtualBackground(
        this.currentVideoStream,
        type,
        name,
        customParams,
      ).then((switched) => {
        if (switched) this.updateVirtualBackgroundInfo();
        return switched;
      });
    }
    this.stopVirtualBackground(this.currentVideoStream);
    this.updateVirtualBackgroundInfo();
    return Promise.resolve(true);
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
    }).catch((error) => {
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

  handleStartSharing() {
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
    if (!PreviewService.storeStream(webcamDeviceId, this.currentVideoStream)) {
      this.currentVideoStream.stop();
    }

    if (
      this.currentVideoStream.virtualBgService
      && brightness === 100
      && this.currentVideoStream.virtualBgType === EFFECT_TYPES.NONE_TYPE
    ) {
      this.stopVirtualBackground(this.currentVideoStream);
    }

    this.cleanupStreamAndVideo();

    PreviewService.changeProfile(selectedProfile);
    PreviewService.changeWebcam(webcamDeviceId);
    if (cameraAsContent) {
      startSharingCameraAsContent(webcamDeviceId);
    } else {
      startSharing(webcamDeviceId);
    }
    if (resolve) resolve();
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
    const { resolve, closeModal, sharedDevices, isVisualEffects } = this.props;
    const { webcamDeviceId, brightness } = this.state;
    const shared = sharedDevices.includes(webcamDeviceId);

    if (
      (shared || isVisualEffects)
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
        errorName: error.name,
        errorMessage: error.message,
        errorStack: error.stack,
      },
    }, `getUserMedia failed in video-preview: ${error.name} - ${error.message}`);

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
        this.currentVideoStream.originalStream,
        'video',
      );
    }

    this.setState({ webcamDeviceId: actualDeviceId, });
  }

  getInitialCameraStream(deviceId) {
    const { cameraAsContent } = this.props;
    const defaultProfile = !cameraAsContent
      ? PreviewService.getDefaultProfile()
      : PreviewService.getCameraAsContentProfile();

    return this.getCameraStream(deviceId, defaultProfile);
  }

  async startEffects(deviceId) {
    // Brightness and backgrounds are independent of each other,
    // handle each one separately.
    try {
      await this.startCameraBrightness();
    } catch (error) {
      logger.warn({
        logCode: 'brightness_effect_error',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, 'Failed to start brightness effect');
    }

    let type;
    let name;
    let customParams;

    const { backgrounds } = this.context;
    const { webcamBackgroundURL } = backgrounds;
    const storedBackgroundInfo = getSessionVirtualBackgroundInfo(deviceId);

    if (storedBackgroundInfo) {
      type = storedBackgroundInfo.type;
      name = storedBackgroundInfo.name;
      customParams = storedBackgroundInfo.customParams;
    } else if (webcamBackgroundURL) {
      const { data, filename } = webcamBackgroundURL;
      type = EFFECT_TYPES.IMAGE_TYPE;
      name = filename;
      customParams = { file: data };
    }

    if (!type) return Promise.resolve(true);

    try {
      return this.handleVirtualBgSelected(type, name, customParams);
    } catch (error) {
      this.handleVirtualBgError(error, type, name);
      clearSessionVirtualBackgroundInfo(deviceId);
      throw error;
    }
  }

  getCameraStream(deviceId, profile) {
    const { webcamDeviceId } = this.state;
    const { cameraAsContent } = this.props;

    this.setState({
      selectedProfile: profile.id,
      isStartSharingDisabled: true,
      previewError: undefined,
    });

    this.terminateCameraStream(this.currentVideoStream, webcamDeviceId);
    this.cleanupStreamAndVideo();

    // The return of doGUM is an instance of BBBVideoStream (a thin wrapper over a MediaStream)
    return PreviewService.doGUM(deviceId, profile).then((bbbVideoStream) => {
      // Late GUM resolve, clean up tracks, stop.
      if (!this._isMounted) {
        this.terminateCameraStream(bbbVideoStream, deviceId);
        this.cleanupStreamAndVideo();
        return Promise.resolve(false);
      }

      this.currentVideoStream = bbbVideoStream;
      this.updateDeviceId(deviceId);

      if (cameraAsContent) {
        this.setState({
          isStartSharingDisabled: false,
        });

        return Promise.resolve(true);
      }

      return this.startEffects(deviceId)
        .catch((error) => {
          if (this.shouldSkipVideoPreview()) {
            throw error;
          }
        })
        .finally(() => {
          if (this._isMounted) {
            this.setState({
              isStartSharingDisabled: false,
            });
          } else {
            this.terminateCameraStream(bbbVideoStream, deviceId);
            this.cleanupStreamAndVideo();
          }
        });
    }).catch((error) => {
      // When video preview is set to skip, we need some way to bubble errors
      // up to users; so re-throw the error
      if (!PreviewService.getSkipVideoPreview()) {
        this.handlePreviewError('do_gum_preview', error, 'displaying final selection');
      } else {
        throw error;
      }
    });
  }

  displayPreview() {
    if (this.currentVideoStream && this.video) {
      this.video.srcObject = this.currentVideoStream.mediaStream;
    }
  }

  skipVideoPreview() {
    this.getInitialCameraStream().then(() => {
      this.handleStartSharing();
    }).catch(error => {
      this.cleanupStreamAndVideo();
      notify(this.handleGUMError(error), 'error', 'video');
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
      isVisualEffects,
      cameraAsContent,
    } = this.props;

    const {
      webcamDeviceId,
      availableWebcams,
      selectedProfile,
    } = this.state;

    const shared = sharedDevices.includes(webcamDeviceId);
    const shouldShowVirtualBackgrounds = isVirtualBackgroundsEnabled() && !cameraAsContent;

    if (isVisualEffects) {
      return (
        <>
          {isVirtualBackgroundsEnabled() && this.renderVirtualBgSelector()}
        </>
      );
    }

    return (
      <>

      { cameraAsContent
        ? (
          <>
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
          </>
        ) 
        :
          <>
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
          { shared
            ? (
              <Styled.Label>
                {intl.formatMessage(intlMessages.sharedCameraLabel)}
              </Styled.Label>
            )
            : (
              <>
                <Styled.Label htmlFor="setQuality">
                  {intl.formatMessage(intlMessages.qualityLabel)}
                </Styled.Label>
                {PreviewService.PREVIEW_CAMERA_PROFILES.length > 0
                  ? (
                    <Styled.Select
                      id="setQuality"
                      value={selectedProfile || ''}
                      onChange={this.handleSelectProfile}
                    >
                      {PreviewService.PREVIEW_CAMERA_PROFILES.map((profile) => {
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
            )
          }
          {shouldShowVirtualBackgrounds && this.renderVirtualBgSelector()}
          </>
      }
      </>
    );
  }

  handleBrightnessAreaChange() {
    const { wholeImageBrightness } = this.state;
    this.currentVideoStream.toggleCameraBrightnessArea(!wholeImageBrightness);
    this.setState({ wholeImageBrightness: !wholeImageBrightness });
  }

  renderBrightnessInput() {
    const {
      cameraAsContent,
    } = this.props;
    const {
      webcamDeviceId,
    } = this.state;
    if (!ENABLE_CAMERA_BRIGHTNESS) return null;

    const { intl } = this.props;
    const { brightness, wholeImageBrightness, isStartSharingDisabled } = this.state;
    const shared = this.isAlreadyShared(webcamDeviceId);

    const origin = brightness <= 100 ? 'left' : 'right';
    const offset = origin === 'left'
      ? (brightness * 100) / 200
      : ((200 - brightness) * 100) / 200;

    if(cameraAsContent){ return null }

    return (
      <>
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
            this.currentVideoStream.changeCameraBrightness(brightness);
            this.setState({ brightness });
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
      </>
    );
  }

  renderVirtualBgSelector() {
    const { isVisualEffects } = this.props;
    const { isStartSharingDisabled, webcamDeviceId } = this.state;
    const initialVirtualBgState = this.currentVideoStream ? {
      type: this.currentVideoStream.virtualBgType,
      name: this.currentVideoStream.virtualBgName
    } : getSessionVirtualBackgroundInfoWithDefault(webcamDeviceId);

    return (
      <VirtualBgSelector
        handleVirtualBgSelected={this.handleVirtualBgSelected}
        locked={isStartSharingDisabled}
        showThumbnails={SHOW_THUMBNAILS}
        initialVirtualBgState={initialVirtualBgState}
        isVisualEffects={isVisualEffects}
      />
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

    const { animations } = Settings.application;

    switch (viewState) {
      case VIEW_STATES.finding:
        return (
          <Styled.Content>
            <Styled.VideoCol>
              <div>
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
            <Styled.Col>
              {this.renderDeviceSelectors()}
              {this.renderBrightnessInput()}
            </Styled.Col>
          </Styled.Content>
        );
    }
  }

  getModalTitle() {
    const { intl, cameraAsContent } = this.props;
    if (cameraAsContent) return intl.formatMessage(intlMessages.cameraAsContentSettingsTitle);
    return intl.formatMessage(intlMessages.webcamSettingsTitle);
  }

  startCameraBrightness() {
    if (CAMERA_BRIGHTNESS_AVAILABLE) {
      const setBrightnessInfo = () => {
        const stream = this.currentVideoStream || {};
        const service = stream.virtualBgService || {};
        const { brightness = 100, wholeImageBrightness = false } = service;
        this.setState({ brightness, wholeImageBrightness });
      };

      if (!this.currentVideoStream.virtualBgService) {
        return this.startVirtualBackground(
          this.currentVideoStream,
          EFFECT_TYPES.NONE_TYPE,
        ).then((switched) => {
          if (switched) {
            setBrightnessInfo();
          }
        });
      }

      setBrightnessInfo();
    }

    return Promise.resolve(true);
  }

  updateVirtualBackgroundInfo() {
    const { webcamDeviceId } = this.state;

    // Update this session's virtual camera effect information if it's enabled
    setSessionVirtualBackgroundInfo(
      this.currentVideoStream.virtualBgType,
      this.currentVideoStream.virtualBgName,
      this.currentVideoStream.customParams,
      webcamDeviceId,
    );
  }

  renderModalContent() {
    const {
      intl,
      hasVideoStream,
      forceOpen,
      camCapReached,
      isVisualEffects,
    } = this.props;

    const {
      isStartSharingDisabled,
      webcamDeviceId,
      deviceError,
      previewError,
    } = this.state;
    const shouldDisableButtons = PreviewService.getSkipVideoPreview()
    && !forceOpen
    && !(deviceError || previewError);

    const shared = this.isAlreadyShared(webcamDeviceId);

    const { isIe } = browserInfo;

    return (
      <>
        {isIe ? (
          <Styled.BrowserWarning>
            <FormattedMessage
              id="app.audioModal.unsupportedBrowserLabel"
              description="Warning when someone joins with a browser that isnt supported"
              values={{
                0: <a href="https://www.google.com/chrome/">Chrome</a>,
                1: <a href="https://getfirefox.com">Firefox</a>,
              }}
            />
          </Styled.BrowserWarning>
        ) : null}

        {this.renderContent()}

        {!isVisualEffects ? (
          <Styled.Footer>
            {hasVideoStream && VideoService.isMultipleCamerasEnabled()
              ? (
                <Styled.ExtraActions>
                  <Button
                    color="danger"
                    label={intl.formatMessage(intlMessages.stopSharingAllLabel)}
                    onClick={this.handleStopSharingAll}
                    disabled={shouldDisableButtons}
                  />
                </Styled.ExtraActions>
              )
              : null
            }
            <Styled.Actions>
              {!shared && camCapReached ? (
                <span>{intl.formatMessage(intlMessages.camCapReached)}</span>
              ) : (<Button
              data-test="startSharingWebcam"
              color={shared ? 'danger' : 'primary'}
              label={intl.formatMessage(shared ? intlMessages.stopSharingLabel : intlMessages.startSharingLabel)}
              onClick={shared ? this.handleStopSharing : this.handleStartSharing}
              disabled={isStartSharingDisabled || isStartSharingDisabled === null || shouldDisableButtons}
            />)}
            </Styled.Actions>
          </Styled.Footer>
        ) : null }
      </>
    );
  }

  render() {
    const {
      intl,
      isCamLocked,
      forceOpen,
      isVisualEffects,
      isOpen,
      priority,
    } = this.props;

    if (isCamLocked === true) {
      this.handleProceed();
      return null;
    }

    if (PreviewService.getSkipVideoPreview() && !forceOpen) {
      return null;
    }

    const {
      deviceError,
      previewError,
    } = this.state;

    const allowCloseModal = !!(deviceError || previewError)
    || !PreviewService.getSkipVideoPreview()
    || forceOpen;

    const title = isVisualEffects
      ? intl.formatMessage(intlMessages.webcamEffectsTitle)
      : intl.formatMessage(intlMessages.webcamSettingsTitle);

    return (
      <Styled.VideoPreviewModal
        onRequestClose={this.handleProceed}
        contentLabel={intl.formatMessage(intlMessages.webcamSettingsTitle)}
        shouldShowCloseButton={allowCloseModal}
        shouldCloseOnOverlayClick={allowCloseModal}
        isPhone={deviceInfo.isPhone}
        data-test="webcamSettingsModal"
        title={title}
        {...{
          isOpen,
          priority,
        }}
      >
        {deviceInfo.hasMediaDevices
          ? this.renderModalContent()
          : this.supportWarning()
        }
      </Styled.VideoPreviewModal>
    );
  }
}

VideoPreview.propTypes = propTypes;
VideoPreview.defaultProps = defaultProps;
VideoPreview.contextType = CustomVirtualBackgroundsContext;

export default injectIntl(VideoPreview);
