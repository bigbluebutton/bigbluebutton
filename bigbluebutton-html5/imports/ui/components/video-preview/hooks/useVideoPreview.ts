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
  CustomBackground,
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
  forceOpen,
  onStreamChange,
  startSharing,
  startSharingCameraAsContent,
}: UseVideoPreviewProps): UseVideoPreviewReturn => {
  const intl = useIntl();
  const isMounted = useRef(true);
  const customVirtualBackgroundsContext = useContext(CustomVirtualBackgroundsContext);

  const [virtualBackgroundActive, setVirtualBackgroundActive] = useState<boolean>(false);
  const [availableWebcams, setAvailableWebcams] = useState<WebcamDevice[]>([]);
  const [selectedProfile, setSelectedProfile] = useState<string>(initialProfileId);
  const [viewState, setViewState] = useState<string>(VIEW_STATES.finding);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [skipPreviewFailed, setSkipPreviewFailed] = useState(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(true);
  const [brightness, setBrightness] = useState<number>(DEFAULT_BRIGHTNESS_STATE.brightness);
  const [wholeImageBrightness, setWholeImageBrightness] = useState<boolean>(
    DEFAULT_BRIGHTNESS_STATE.wholeImageBrightness,
  );

  const webcamDeviceId = useRef<string | null>(initialDeviceId);
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

  const updateVirtualBackgroundInfo = useCallback((deviceId?: string | null) => {
    if (currentVideoStream.current) {
      setSessionVirtualBackgroundInfo(
        deviceId || webcamDeviceId.current,
        currentVideoStream.current.virtualBgType,
        currentVideoStream.current.virtualBgName,
        // @ts-ignore
        currentVideoStream.current.virtualBgUniqueId,
      );
    }
  }, [webcamDeviceId.current]);

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
    deviceId?: string | null,
  ): Promise<boolean> => {
    // @ts-ignore
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (type !== EFFECT_TYPES.NONE_TYPE || (CAMERA_BRIGHTNESS_AVAILABLE && brightness !== 100)) {
      const switched = await startVirtualBackground(currentVideoStream.current, type, name, customParams);
      if (switched) updateVirtualBackgroundInfo(deviceId);
      if (type !== EFFECT_TYPES.NONE_TYPE) {
        setVirtualBackgroundActive(true);
      }
      return switched;
    }
    stopVirtualBackground(currentVideoStream.current);
    updateVirtualBackgroundInfo(deviceId);
    return Promise.resolve(true);
  }, [brightness, startVirtualBackground, stopVirtualBackground, updateVirtualBackgroundInfo]);

  const applyCustomVirtualBg = useCallback(async (
    type: string,
    name: string,
    uniqueId: string,
    webcamDeviceIdToUse: string | null,
  ) => {
    const { backgrounds, loaded } = customVirtualBackgroundsContext;
    let customParams: CustomBgParams | undefined;

    const getCustomParams = (bgs: { [key: string]: CustomBackground }): CustomBgParams => {
      const background = bgs[uniqueId] || Object.values(bgs).find((bg) => bg.uniqueId === uniqueId);
      if (background?.data) {
        return { uniqueId, file: background.data };
      }
      throw new Error('Missing virtual background data');
    };

    if (backgrounds[uniqueId]) {
      customParams = getCustomParams(backgrounds as { [key: string]: CustomBackground });
    } else if (!loaded) {
      // Virtual BG context might not be loaded yet (in case this is
      // skipping the video preview). Load it manually.
      customParams = await new Promise<CustomBgParams>((resolve, reject) => {
        VBGSelectorService.load(
          reject,
          (loadedBgs: { [key: string]: CustomBackground }) => resolve(getCustomParams(loadedBgs)),
        );
      });
    } else {
      throw new Error('Missing virtual background');
    }

    await handleVirtualBgSelected(type, name, customParams, webcamDeviceIdToUse);
  }, [customVirtualBackgroundsContext, handleVirtualBgSelected]);

  const applyStoredVirtualBg = useCallback(async (deviceId: string | null = null) => {
    const webcamDeviceIdToUse = deviceId || webcamDeviceId.current;

    // Apply the virtual background stored in Local/Session Storage, if any
    // If it fails, remove the stored background.
    const virtualBackground = getSessionVirtualBackgroundInfo(webcamDeviceIdToUse as string) as {
      type: string, name: string, uniqueId: string
    };

    try {
      if (virtualBackground) {
        const { type, name, uniqueId } = virtualBackground;
        // If uniqueId is defined, this is a custom background. Fetch the custom
        // params from the context and apply them
        if (uniqueId) {
          await applyCustomVirtualBg(type, name, uniqueId, webcamDeviceIdToUse);
        } else {
          // Built-in background, just apply it.
          await handleVirtualBgSelected(type, name, undefined, webcamDeviceIdToUse);
        }
        return;
      }

      const { webcamBackgroundURL } = customVirtualBackgroundsContext.backgrounds;
      if (webcamBackgroundURL) {
        // Apply custom background from JOIN URL parameter automatically
        // only if there's not any session background yet.
        const {
          filename, data, type, uniqueId,
        } = webcamBackgroundURL;
        const customParams = { file: data, uniqueId };
        await handleVirtualBgSelected(type, filename, customParams, webcamDeviceIdToUse);
      }
    } catch (error) {
      const { type, name } = virtualBackground || customVirtualBackgroundsContext.backgrounds.webcamBackgroundURL || {};
      handleVirtualBgError(error as Error, type, name);
      removeSessionVirtualBackgroundInfo(webcamDeviceIdToUse);
      throw error;
    }
  }, [
    webcamDeviceId.current,
    customVirtualBackgroundsContext,
    handleVirtualBgSelected,
    handleVirtualBgError,
    applyCustomVirtualBg,
  ]);

  const updateDeviceId = useCallback((deviceId: string | null) => {
    let actualDeviceId = deviceId;
    if (!actualDeviceId && currentVideoStream.current) {
      actualDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
        currentVideoStream.current.mediaStream,
        'video',
      );
    }
    webcamDeviceId.current = actualDeviceId;
    return actualDeviceId;
  }, []);

  const updateCameraBrightnessInfo = useCallback(() => {
    if (currentVideoStream.current) {
      setCameraBrightnessInfo(webcamDeviceId.current, brightness, wholeImageBrightness);
    }
  }, [webcamDeviceId.current, brightness, wholeImageBrightness]);

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

  const setCameraBrightnessCb = useCallback(async (newBrightness: number, deviceId?: string | null) => {
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
        setCameraBrightnessInfo(deviceId || webcamDeviceId.current, newBrightness, wholeImageBrightness);
      }
    }
  }, [startCameraBrightness, wholeImageBrightness, isCameraShared, webcamDeviceId.current]);

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
          setCameraBrightnessInfo(webcamDeviceId.current, brightness, newWholeImageBrightness);
        }
        return newWholeImageBrightness;
      });
    }
  }, [startCameraBrightness, brightness, isCameraShared, webcamDeviceId.current]);

  const applyStoredBrightness = useCallback(async (deviceId: string | null = null) => {
    const webcamDeviceIdToUse = deviceId || webcamDeviceId.current;
    const cameraBrightness = getCameraBrightnessInfo(webcamDeviceIdToUse) as {
      brightness: number, wholeImageBrightness: boolean
    };
    const stateToApply = (cameraBrightness && !isEqual(cameraBrightness, DEFAULT_BRIGHTNESS_STATE))
      ? cameraBrightness
      : DEFAULT_BRIGHTNESS_STATE;

    setBrightness(stateToApply.brightness);
    setWholeImageBrightness(stateToApply.wholeImageBrightness);
    await startCameraBrightness(stateToApply);
  }, [startCameraBrightness]);

  const getCameraStream = useCallback(async (
    deviceId: string | null,
    profile: CameraProfileProps,
  ) => {
    setSelectedProfile(profile.id);
    setPreviewError(null);
    setIsCameraLoading(true);

    terminateCameraStream(currentVideoStream.current, webcamDeviceId.current);
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
      // When video preview is set to skip, we need some way to bubble errors
      // up to users; so re-throw the error
      if (!shouldSkipVideoPreview()) {
        handlePreviewError('do_gum_preview', error as Error & { name: string }, 'displaying final selection');
      } else {
        throw error;
      }
    }

    // Restore virtual background and brightness if it was stored in Local/Session Storage
    try {
      if (!isCameraAsContent) {
        await applyStoredVirtualBg(finalDeviceId);
        await applyStoredBrightness(finalDeviceId);
      }
    } catch (error) {
      // Only bubble up errors in this case if we're skipping the video preview
      // This is because virtual background failures are deemed critical when
      // skipping the video preview, but not otherwise
      if (shouldSkipVideoPreview()) {
        throw error;
      }
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
    isCameraAsContent,
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
    // Video preview skip is activated, short circuit via a simpler procedure
    if (PreviewService.getSkipVideoPreview() && !forceOpen) {
      skipVideoPreview();
      return;
    }
    // Late enumerateDevices resolution, stop.
    if (!isMounted.current) return;

    let processedCamerasList = digestedWebcams;
    const initialDeviceId = processedCamerasList[0]?.deviceId || webcamDeviceId.current;

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
        } = await PreviewService.doEnumerateDevices({ priorityDeviceId: webcamDeviceId.current });
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
    webcamDeviceId.current,
    isCameraAsContent,
    getCameraStream,
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
        PreviewService.doEnumerateDevices({ priorityDeviceId: webcamDeviceId.current })
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
  }, [populatePreview, webcamDeviceId.current, handleDeviceError]);

  useEffect(() => {
    isMounted.current = true;

    initializeCameras();

    return () => {
      isMounted.current = false;
      terminateCameraStream(currentVideoStream.current, webcamDeviceId.current);
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
    await getInitialCameraStream(deviceId);
    displayPreview();
  }, [getInitialCameraStream, displayPreview]);

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
    await getCameraStream(webcamDeviceId.current, profile);
    displayPreview();
  }, [webcamDeviceId.current, getCameraStream, displayPreview]);

  const handleStartSharing = useCallback(async (deviceId: string) => {
    if (!currentVideoStream.current) return;

    // Only streams that will be shared should be stored in the service.
    // If the store call returns false, we're duplicating stuff. So clean this one
    // up because it's an impostor.
    if (!PreviewService.storeStream(deviceId, currentVideoStream.current)) {
      currentVideoStream.current.stop();
    }

    if (
      currentVideoStream.current?.virtualBgService
        && brightness === 100
        && currentVideoStream.current?.virtualBgType === EFFECT_TYPES.NONE_TYPE
    ) {
      stopVirtualBackground(currentVideoStream.current);
    }

    if (!isCameraAsContent) {
      // Store selected profile, camera ID and virtual background in the storage for future use
      PreviewService.changeProfile(selectedProfile);
      PreviewService.changeWebcam(deviceId);
      updateVirtualBackgroundInfo();
      updateCameraBrightnessInfo();
      cleanupStreamAndVideo();
      if (startSharing) startSharing(deviceId);
    } else {
      cleanupStreamAndVideo();
      if (startSharingCameraAsContent) startSharingCameraAsContent(deviceId);
    }
  }, [
    currentVideoStream,
    brightness,
    isCameraAsContent,
    selectedProfile,
    stopVirtualBackground,
    updateVirtualBackgroundInfo,
    updateCameraBrightnessInfo,
    cleanupStreamAndVideo,
    startSharing,
    startSharingCameraAsContent,
  ]);

  const skipVideoPreview = useCallback(() => {
    getInitialCameraStream(webcamDeviceId.current)
      .then((newDeviceId) => {
        if (isMounted.current && newDeviceId) {
          handleStartSharing(newDeviceId);
        }
      })
      .catch((error) => {
        logger.warn({
          logCode: 'video_preview_skip_failure',
          extraInfo: { errorName: (error as Error & { name: string }).name, errorMessage: error.message },
        }, 'Skipping video preview failed');
        PreviewService.clearWebcamDeviceId();
        PreviewService.clearWebcamProfileId();
        removeSessionVirtualBackgroundInfo(webcamDeviceId.current);
        cleanupStreamAndVideo();
        // Mark the skip as failed so that the component will override any option
        // to skip the video preview and display the default UI
        if (isMounted.current) setSkipPreviewFailed(true);
        throw error;
      });
  }, [getInitialCameraStream, handleStartSharing, cleanupStreamAndVideo]);

  const shouldSkipVideoPreview = useCallback(() => {
    return PreviewService.getSkipVideoPreview() && !forceOpen && !skipPreviewFailed && !isCameraShared;
  }, [forceOpen, skipPreviewFailed, isCameraShared]);

  return {
    // state
    webcamDeviceId: webcamDeviceId.current,
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
    getInitialCameraStream,
    shouldSkipVideoPreview,
    handleStartSharing,
    VIEW_STATES,
  };
};

export default useVideoPreview;
