import {
  useState, useEffect, useRef, useContext, useCallback,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { isEqual } from 'radash';
import logger from '/imports/startup/client/logger';
import deviceInfo from '/imports/utils/deviceInfo';
import PreviewService from '../service';
import VideoService from '/imports/ui/components/video-provider/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { notify } from '/imports/ui/services/notification';
import {
  EFFECT_TYPES,
  setSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfo,
  removeSessionVirtualBackgroundInfo,
  isVirtualBackgroundSupported,
  setCameraBrightnessInfo,
  getCameraBrightnessInfo,
} from '/imports/ui/services/virtual-background/service';
import { CustomVirtualBackgroundsContext } from '/imports/ui/components/video-preview/virtual-background/context';
import VBGSelectorService from '/imports/ui/components/video-preview/virtual-background/service';
import {
  BBBVideoStream,
  CustomBgParams,
  UseVideoPreviewProps,
  UseVideoPreviewReturn,
  VIEW_STATES,
  WebcamDevice,
  DEFAULT_BRIGHTNESS_STATE,
  CameraProfileProps,
} from './types';

const intlMessages: { [key: string]: { id: string; description?: string } } = defineMessages({
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
});

export const useVideoPreview = ({
  initialDeviceId,
  initialProfileId,
  isCameraAsContent = false,
  isCameraShared = false,
  onStreamChange,
}: UseVideoPreviewProps): UseVideoPreviewReturn => {
  const intl = useIntl();
  const isMounted = useRef(true);
  const customVirtualBackgroundsContext = useContext(CustomVirtualBackgroundsContext);

  const [webcamDeviceId, setWebcamDeviceId] = useState<string | null>(initialDeviceId);
  const [virtualBackgroundActive, setVirtualBackgroundActive] = useState<boolean>(false);
  const [availableWebcams, setAvailableWebcams] = useState<WebcamDevice[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>(initialProfileId);
  const [viewState, setViewState] = useState<string>(VIEW_STATES.finding);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(DEFAULT_BRIGHTNESS_STATE.brightness);
  const [wholeImageBrightness, setWholeImageBrightness] = useState<boolean>(
    DEFAULT_BRIGHTNESS_STATE.wholeImageBrightness,
  );

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentVideoStream = useRef<BBBVideoStream | null>(null);

  const handleGUMError = useCallback((error: Error & { name: string }) => {
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
      { error: `${error.name}: ${error.message}` });
  }, [intl]);

  const handlePreviewError = useCallback((logCode: string, error: Error & { name: string }, description: string) => {
    logger.warn({
      logCode: `video_preview_${logCode}_error`,
      extraInfo: { errorName: error.name, errorMessage: error.message },
    }, `Error ${description}`);
    setPreviewError(handleGUMError(error));
  }, [handleGUMError]);

  const handleDeviceError = useCallback((logCode: string, error: Error & { name: string }, description: string) => {
    logger.warn({
      logCode: `video_preview_${logCode}_error`,
      extraInfo: { errorName: error.name, errorMessage: error.message },
    }, `Error ${description}`);
    setViewState(VIEW_STATES.error);
    setDeviceError(handleGUMError(error));
  }, [handleGUMError]);

  const handleLocalStreamInactive = useCallback(({ id }: { id: string }) => {
    if (currentVideoStream.current && typeof id === 'string' && currentVideoStream.current.mediaStream?.id === id) {
      setIsCameraLoading(true);
      handlePreviewError('stream_inactive', new Error('inactiveError') as Error & { name: string }, '- preview camera stream inactive');
    }
  }, [handlePreviewError]);

  const setCurrentVideoStream = useCallback((bbbVideoStream: BBBVideoStream | null) => {
    // Stream is being unset - remove gUM revocation handler to avoid false negatives
    if (currentVideoStream.current) {
      currentVideoStream.current.removeListener('inactive', handleLocalStreamInactive);
    }
    // Set up inactivation handler for the new stream (to, eg, detect gUM revocation)
    if (bbbVideoStream) {
      bbbVideoStream.once('inactive', handleLocalStreamInactive);
    }
    currentVideoStream.current = bbbVideoStream;
    if (onStreamChange) onStreamChange(bbbVideoStream);
  }, [handleLocalStreamInactive, onStreamChange]);

  const cleanupStreamAndVideo = useCallback(() => {
    setCurrentVideoStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  }, [setCurrentVideoStream]);

  const terminateCameraStream = useCallback((stream: BBBVideoStream | null, deviceId: string | null) => {
    if (stream) {
      // Stream is being destroyed - remove gUM revocation handler to avoid false negatives
      stream.removeListener('inactive', handleLocalStreamInactive);
      PreviewService.terminateCameraStream(stream, deviceId);
    }
  }, [handleLocalStreamInactive]);

  const displayPreview = useCallback(() => {
    if (currentVideoStream.current && videoRef.current) {
      videoRef.current.srcObject = currentVideoStream.current.mediaStream;
    }
  }, []);

  const handleVirtualBgError = useCallback((error: Error, type: string, name?: string) => {
    logger.error({
      logCode: 'video_preview_virtualbg_error',
      extraInfo: {
        errorName: (error as Error & { name: string }).name,
        errorMessage: error.message,
        errorStack: error.stack,
        virtualBgType: type,
        virtualBgName: name,
      },
    }, `Failed to toggle virtual background: ${error.message}`);
    notify(intl.formatMessage(intlMessages.virtualBgGenericError), 'error', 'video');
  }, [intl]);

  const updateVirtualBackgroundInfo = useCallback(() => {
    if (currentVideoStream.current) {
      setSessionVirtualBackgroundInfo(
        webcamDeviceId,
        currentVideoStream.current.virtualBgType,
        currentVideoStream.current.virtualBgName,
        // @ts-ignore
        currentVideoStream.current.virtualBgUniqueId,
      );
    }
  }, [webcamDeviceId]);

  const stopVirtualBackground = useCallback((bbbVideoStream: BBBVideoStream | null) => {
    if (bbbVideoStream) {
      bbbVideoStream.stopVirtualBackground();
      displayPreview();
    }
  }, [displayPreview]);

  const startVirtualBackground = useCallback(async (
    bbbVideoStream: BBBVideoStream | null,
    type: string,
    name?: string,
    customParams?: CustomBgParams,
  ): Promise<boolean> => {
    setIsCameraLoading(true);
    if (bbbVideoStream == null) return Promise.resolve(false);

    try {
      await bbbVideoStream.startVirtualBackground(type, name, customParams);
      displayPreview();
      return true;
    } catch (error) {
      handleVirtualBgError(error as Error, type, name);
      return false;
    } finally {
      setIsCameraLoading(false);
    }
  }, [displayPreview, handleVirtualBgError]);

  // Resolves into true if the background switch is successful, false otherwise
  const handleVirtualBgSelected = useCallback(async (
    type: string,
    name?: string,
    customParams?: CustomBgParams,
  ): Promise<boolean> => {
    // @ts-ignore
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (type !== EFFECT_TYPES.NONE_TYPE || (CAMERA_BRIGHTNESS_AVAILABLE && brightness !== 100)) {
      const switched = await startVirtualBackground(currentVideoStream.current, type, name, customParams);
      if (switched) updateVirtualBackgroundInfo();
      setVirtualBackgroundActive(true);
      return switched;
    }
    stopVirtualBackground(currentVideoStream.current);
    updateVirtualBackgroundInfo();
    return Promise.resolve(true);
  }, [brightness, startVirtualBackground, stopVirtualBackground, updateVirtualBackgroundInfo]);

  const applyStoredVirtualBg = useCallback(async (deviceId: string | null = null) => {
    const webcamDeviceIdToUse = deviceId || webcamDeviceId;

    // Apply the virtual background stored in Local/Session Storage, if any
    // If it fails, remove the stored background.
    const virtualBackground = getSessionVirtualBackgroundInfo(webcamDeviceIdToUse) as {
      type: string, name: string, uniqueId: string
    };

    if (virtualBackground) {
      const { type, name, uniqueId } = virtualBackground;
      return new Promise<void>((resolve, reject) => {
        let customParams;
        const handleFailure = (error: Error) => {
          handleVirtualBgError(error, type, name);
          removeSessionVirtualBackgroundInfo(webcamDeviceIdToUse);
          reject(error);
        };
        const applyCustomVirtualBg = (backgrounds: Record<string, {
          uniqueId: string;
          data: File | Blob;
        }>) => {
          const background = backgrounds[uniqueId]
            || Object.values(backgrounds).find((bg) => bg.uniqueId === uniqueId);

          if (background && background.data) {
            customParams = { uniqueId, file: background?.data };
          } else {
            handleFailure(new Error('Missing virtual background data'));
            return;
          }
          handleVirtualBgSelected(type, name, customParams).then(resolve as () => void, handleFailure);
        };

        // If uniqueId is defined, this is a custom background. Fetch the custom
        // params from the context and apply them
        if (uniqueId) {
          if (customVirtualBackgroundsContext.backgrounds[uniqueId]) {
            applyCustomVirtualBg(customVirtualBackgroundsContext.backgrounds);
          } else if (!customVirtualBackgroundsContext.loaded) {
            // Virtual BG context might not be loaded yet (in case this is
            // skipping the video preview). Load it manually.
            VBGSelectorService.load(handleFailure, applyCustomVirtualBg);
          } else {
            handleFailure(new Error('Missing virtual background'));
          }
          return;
        }

        // Built-in background, just apply it.
        handleVirtualBgSelected(type, name, customParams).then(resolve as () => void, handleFailure);
      });
    } if (customVirtualBackgroundsContext.backgrounds.webcamBackgroundURL) {
      // Apply custom background from JOIN URL parameter automatically
      // only if there's not any session background yet.
      const {
        filename, data, type, uniqueId,
      } = customVirtualBackgroundsContext.backgrounds.webcamBackgroundURL;
      const customParams = { file: data, uniqueId };
      return new Promise<void>((resolve, reject) => {
        const handleFailure = (error: Error) => {
          handleVirtualBgError(error, type, filename);
          removeSessionVirtualBackgroundInfo(webcamDeviceIdToUse);
          reject(error);
        };
        handleVirtualBgSelected(type, filename, customParams).then(resolve as () => void, handleFailure);
      });
    }
    return Promise.resolve();
  }, [webcamDeviceId, customVirtualBackgroundsContext, handleVirtualBgSelected, handleVirtualBgError]);

  const updateDeviceId = useCallback((deviceId: string | null) => {
    let actualDeviceId = deviceId;
    if (!actualDeviceId && currentVideoStream.current) {
      actualDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
        currentVideoStream.current.mediaStream,
        'video',
      );
    }
    setWebcamDeviceId(actualDeviceId);
    return actualDeviceId;
  }, []);

  const updateCameraBrightnessInfo = useCallback(() => {
    if (currentVideoStream.current) {
      setCameraBrightnessInfo(webcamDeviceId, brightness, wholeImageBrightness);
    }
  }, [webcamDeviceId, brightness, wholeImageBrightness]);

  const startCameraBrightness = useCallback(async (initialState = DEFAULT_BRIGHTNESS_STATE) => {
    // @ts-ignore
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (CAMERA_BRIGHTNESS_AVAILABLE && currentVideoStream.current) {
      const applyStreamBrightnessState = () => {
        if (!currentVideoStream.current) return;
        currentVideoStream.current.changeCameraBrightness(initialState.brightness);
        currentVideoStream.current.toggleCameraBrightnessArea(initialState.wholeImageBrightness);
      };

      if (!currentVideoStream.current?.virtualBgService) {
        // Only start the VB engine if we are applying a non-default brightness
        if (!isEqual(initialState, DEFAULT_BRIGHTNESS_STATE)) {
          const switched = await startVirtualBackground(
            currentVideoStream.current,
            EFFECT_TYPES.NONE_TYPE,
          );
          if (switched) {
            applyStreamBrightnessState();
          }
        }
      } else {
        applyStreamBrightnessState();
      }
    }
  }, [startVirtualBackground]);

  const setCameraBrightnessCb = useCallback(async (newBrightness: number) => {
    // @ts-ignore
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (CAMERA_BRIGHTNESS_AVAILABLE && currentVideoStream.current) {
      if (currentVideoStream.current?.virtualBgService == null) {
        await startCameraBrightness({ brightness: newBrightness, wholeImageBrightness });
      }
      currentVideoStream.current.changeCameraBrightness(newBrightness);
      setBrightness(newBrightness);
      if (isCameraShared) {
        setCameraBrightnessInfo(webcamDeviceId, newBrightness, wholeImageBrightness);
      }
    }
  }, [startCameraBrightness, wholeImageBrightness, isCameraShared, webcamDeviceId]);

  const handleBrightnessAreaChange = useCallback(async () => {
    // @ts-ignore
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (CAMERA_BRIGHTNESS_AVAILABLE && currentVideoStream.current) {
      setWholeImageBrightness((prev) => {
        const newWholeImageBrightness = !prev;
        if (currentVideoStream.current?.virtualBgService == null) {
          startCameraBrightness({ brightness, wholeImageBrightness: newWholeImageBrightness });
        }
        currentVideoStream.current?.toggleCameraBrightnessArea(newWholeImageBrightness);
        if (isCameraShared) {
          setCameraBrightnessInfo(webcamDeviceId, brightness, newWholeImageBrightness);
        }
        return newWholeImageBrightness;
      });
    }
  }, [startCameraBrightness, brightness, isCameraShared, webcamDeviceId]);

  const applyStoredBrightness = useCallback(async (deviceId: string | null = null) => {
    const webcamDeviceIdToUse = deviceId || webcamDeviceId;
    const cameraBrightness = getCameraBrightnessInfo(webcamDeviceIdToUse) as {
      brightness: number, wholeImageBrightness: boolean
    };
    const stateToApply = (cameraBrightness && !isEqual(cameraBrightness, DEFAULT_BRIGHTNESS_STATE))
      ? cameraBrightness
      : DEFAULT_BRIGHTNESS_STATE;

    setBrightness(stateToApply.brightness);
    setWholeImageBrightness(stateToApply.wholeImageBrightness);
    await startCameraBrightness(stateToApply);
  }, [webcamDeviceId, startCameraBrightness]);

  const getCameraStream = useCallback(async (
    deviceId: string | null,
    profile: CameraProfileProps,
  ) => {
    setSelectedProfile(profile.id);
    setPreviewError(null);
    setIsCameraLoading(true);
    // State reset: crucial to prevent applying old state to the new stream
    setBrightness(DEFAULT_BRIGHTNESS_STATE.brightness);
    setWholeImageBrightness(DEFAULT_BRIGHTNESS_STATE.wholeImageBrightness);

    terminateCameraStream(currentVideoStream.current, webcamDeviceId);
    cleanupStreamAndVideo();

    let bbbVideoStream;
    let finalDeviceId: string | null = null;
    try {
      // The return of doGUM is an instance of BBBVideoStream (a thin wrapper over a MediaStream)
      bbbVideoStream = await PreviewService.doGUM(deviceId, profile);
      setCurrentVideoStream(bbbVideoStream);
      const updatedDevice = updateDeviceId(deviceId);

      if (updatedDevice !== deviceId) {
        bbbVideoStream = await PreviewService.doGUM(updatedDevice, profile);
        setCurrentVideoStream(bbbVideoStream);
      }
      finalDeviceId = updatedDevice;
    } catch (error) {
      handlePreviewError('do_gum_preview', error as Error & { name: string }, 'displaying final selection');
      throw error;
    }

    // Restore virtual background and brightness if it was stored in Local/Session Storage
    try {
      if (!isCameraAsContent) {
        await applyStoredVirtualBg(finalDeviceId);
        await applyStoredBrightness(finalDeviceId);
      }
    } catch (error) {
      // Failures are not critical unless skipping preview
    }

    // Late VBG resolve, clean up tracks, stop.
    if (!isMounted.current) {
      terminateCameraStream(bbbVideoStream, finalDeviceId);
      cleanupStreamAndVideo();
      return null;
    }

    setIsCameraLoading(false);
    return finalDeviceId;
  }, [
    webcamDeviceId, isCameraAsContent,
    terminateCameraStream, cleanupStreamAndVideo, setCurrentVideoStream,
    updateDeviceId, handlePreviewError, applyStoredVirtualBg, applyStoredBrightness,
  ]);

  const getInitialCameraStream = useCallback((deviceId: string | null) => {
    const defaultProfile = !isCameraAsContent
      ? PreviewService.getDefaultProfile()
      : PreviewService.getCameraAsContentProfile();
    if (!defaultProfile) {
      logger.warn({
        logCode: 'video_preview_profile_missing',
        extraInfo: { defaultProfile, isCameraAsContent },
      }, 'Camera profile not found for selected webcam change');
      return Promise.resolve(null);
    }
    return getCameraStream(deviceId, defaultProfile);
  }, [isCameraAsContent, getCameraStream]);

  const populatePreview = useCallback(async ({
    digestedWebcams = [],
    devices,
    areLabelled,
    areIdentified,
  }: {
    digestedWebcams?: WebcamDevice[];
    devices?: MediaDeviceInfo[];
    areLabelled?: boolean;
    areIdentified?: boolean;
  } = {}) => {
    if (devices) VideoService.updateNumberOfDevices(devices);
    // Late enumerateDevices resolution, stop.
    if (!isMounted.current) return;

    let processedCamerasList = digestedWebcams;
    const initialDeviceId = processedCamerasList[0]?.deviceId || webcamDeviceId;

    await getInitialCameraStream(initialDeviceId);
    // Late gUM resolve, stop.
    if (!isMounted.current) return;

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
            errorName: (error as Error & { name: string }).name, errorMessage: (error as Error).message,
          },
        }, 'enumerateDevices for relabelling failed');
      }
    }

    if (processedCamerasList.length > 0) {
      setAvailableWebcams(processedCamerasList);
      setViewState(VIEW_STATES.found);
      displayPreview();
    } else {
      // There were no webcams coming from enumerateDevices. Throw an error.
      const noWebcamsError = new Error('NotFoundError');
      handleDeviceError('enumerate', noWebcamsError, ': no webcams found');
    }
  }, [
    isMounted,
    webcamDeviceId,
    getInitialCameraStream,
    handleDeviceError,
    setAvailableWebcams,
    setViewState,
    displayPreview,
  ]);

  const initializeCameras = useCallback(() => {
    if (deviceInfo.hasMediaDevices) {
      // @ts-ignore
      const SKIP_INITIAL_ENUM = window.meetingClientSettings.public.media.skipInitialCamEnumeration;
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
      handleDeviceError('mount', error, ': navigator.mediaDevices unavailable');
    }
  }, [populatePreview, webcamDeviceId, handleDeviceError]);

  useEffect(() => {
    isMounted.current = true;

    initializeCameras();

    return () => {
      isMounted.current = false;
      terminateCameraStream(currentVideoStream.current, webcamDeviceId);
      cleanupStreamAndVideo();
    };
  }, []);

  useEffect(() => {
    if (viewState === VIEW_STATES.found && !videoRef.current?.srcObject) {
      displayPreview();
    }
  }, [viewState, displayPreview]);

  const handleSelectWebcam = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value;
    const profile = isCameraAsContent
      ? PreviewService.getCameraAsContentProfile()
      : PreviewService.getCameraProfile(selectedProfile);

    if (!profile) {
      logger.warn({
        logCode: 'video_preview_profile_missing',
        extraInfo: { selectedProfile, isCameraAsContent },
      }, 'Camera profile not found for selected webcam change');
      return;
    }
    await getCameraStream(deviceId, profile);
    displayPreview();
  }, [selectedProfile, isCameraAsContent, getCameraStream, displayPreview]);

  const handleSelectProfile = useCallback(async (event: React.ChangeEvent<HTMLSelectElement>) => {
    const profileId = event.target.value;
    const profile = PreviewService.getCameraProfile(profileId);
    if (!profile) {
      logger.warn({
        logCode: 'video_preview_profile_missing',
        extraInfo: { selectedProfile, isCameraAsContent },
      }, 'Camera profile not found for selected webcam change');
      return;
    }
    await getCameraStream(webcamDeviceId, profile);
    displayPreview();
  }, [webcamDeviceId, getCameraStream, displayPreview]);

  return {
    // state
    webcamDeviceId,
    virtualBackgroundActive,
    availableWebcams,
    selectedProfile,
    viewState,
    deviceError,
    previewError,
    isCameraLoading,
    brightness,
    wholeImageBrightness,
    videoRef,
    currentVideoStream,
    // functions
    initializeCameras,
    getInitialCameraStream,
    displayPreview,
    handleSelectWebcam,
    handleSelectProfile,
    handleVirtualBgSelected,
    setCameraBrightness: setCameraBrightnessCb,
    handleBrightnessAreaChange,
    stopVirtualBackground,
    updateVirtualBackgroundInfo,
    updateCameraBrightnessInfo,
    terminateCameraStream,
    cleanupStreamAndVideo,
    setCurrentVideoStream,
    VIEW_STATES,
  };
};

export default useVideoPreview;
