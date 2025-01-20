import React, {
  useContext, useRef, useEffect, useState,
} from 'react';
import { defineMessages, useIntl } from 'react-intl';
import { useMutation } from '@apollo/client';
import { Layout } from '../layout/layoutTypes';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Slider from '@mui/material/Slider';
import Styled from './styles';
import { layoutDispatch, layoutSelect } from '../layout/context';
import { ACTIONS, PANELS } from '../layout/enums';
import { useStorageKey } from '../../services/storage/hooks';
import deviceInfo from '/imports/utils/deviceInfo';
import VideoService from '/imports/ui/components/video-provider/service';
import PreviewService from '/imports/ui/components/video-preview/service';
import logger from '/imports/startup/client/logger';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import { getSettingsSingletonInstance } from '/imports/ui/services/settings';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { SET_AWAY } from '../user-list/user-list-participants/list-item/mutations';
import { muteAway } from '/imports/ui/components/audio/audio-graphql/audio-controls/input-stream-live-selector/service';
import useToggleVoice from '/imports/ui/components/audio/audio-graphql/hooks/useToggleVoice';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import Auth from '/imports/ui/services/auth';
import {
  EFFECT_TYPES,
  setSessionVirtualBackgroundInfo,
  getSessionVirtualBackgroundInfo,
  removeSessionVirtualBackgroundInfo,
  isVirtualBackgroundSupported,
  getSessionVirtualBackgroundInfoWithDefault,
} from '/imports/ui/services/virtual-background/service';
import { CustomVirtualBackgroundsContext } from '/imports/ui/components/video-preview/virtual-background/context';
import { notify } from '/imports/ui/services/notification';
import { useSharedDevices, useIsUserLocked } from '/imports/ui/components/video-provider/hooks';
import { useIsCustomVirtualBackgroundsEnabled, useIsVirtualBackgroundsEnabled } from '../../services/features';
import VirtualBgSelector from '/imports/ui/components/video-preview/virtual-background/component';
import AudioSelectors from './audio-selectors/component';
import AudioCaptions from './audio-captions/component';
import BBBVideoStream from '/imports/ui/services/webrtc-base/bbb-video-stream';
import { colorPrimary } from '../../stylesheets/styled-components/palette';

const intlMessages: { [key: string]: { id: string; description?: string } } = defineMessages({
  title: {
    id: 'app.profileSettings.title',
    description: 'Label for the profile settings panel title',
  },
  close: {
    id: 'app.profileSettings.close',
    description: 'Label for the close profile settings button',
  },
  username: {
    id: 'app.profileSettings.usernameTitle',
    description: 'Label for the username title in profile settings',
  },
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
  awayLabel: {
    id: 'app.actionsBar.reactions.away',
    description: 'Away Label',
  },
  activeLabel: {
    id: 'app.actionsBar.reactions.active',
    description: 'Active Label',
  },
});

interface CameraProfileProps {
  id: string;
  name: string;
  default?: boolean;
  bitrate: number;
  constraints?: {
    width: number;
    height: number;
    frameRate?: number;
  };
}

const VIEW_STATES = {
  finding: 'finding',
  found: 'found',
  error: 'error',
};

interface ProfileSettingsProps {
}
const ProfileSettings: React.FC<ProfileSettingsProps> = () => {
  const { formatMessage } = useIntl();
  const sharedDevices = useSharedDevices();
  const isCamLocked = useIsUserLocked();
  const isVirtualBackgroundsEnabled = useIsVirtualBackgroundsEnabled();
  const isCustomVirtualBackgroundsEnabled = useIsCustomVirtualBackgroundsEnabled();

  const settingsStorage = window.meetingClientSettings.public.app.userSettingsStorage;
  const [webcamDeviceId, setWebcamDeviceId] = useState<string | null>(
    useStorageKey('WebcamDeviceId', settingsStorage) as string || null,
  );
  const layoutContextDispatch = layoutDispatch();
  const isRTL = layoutSelect((i: Layout) => i.isRTL);
  const isMounted = useRef<boolean>(true);

  // video state
  const [availableWebcams, setAvailableWebcams] = useState<MediaDeviceInfo[] | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [viewState, setViewState] = useState<string>(VIEW_STATES.finding);
  const [deviceError, setDeviceError] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [brightness, setBrightness] = useState<number>(100);
  // @ts-expect-error TS6133: Unused variable.
  const [wholeImageBrightness, setWholeImageBrightness] = useState<boolean>(false);
  const [isCameraLoading, setIsCameraLoading] = useState<boolean>(true);
  const [virtualBackgroundChecked, setVirtualBackgroundChecked] = React.useState(false);

  const currentVideoStream = useRef<BBBVideoStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const customVirtualBackgroundsContext = useContext(
    CustomVirtualBackgroundsContext,
  );

  const { data: currentUserData } = useCurrentUser((user) => ({
    name: user.name,
    away: user.away,
    inAudio: user.voice,
  }));

  const voiceToggle = useToggleVoice();
  const { data: unmutedUsers } = useWhoIsUnmuted();

  const muted = !unmutedUsers[Auth.userID as string];
  const away = currentUserData?.away ?? false;

  const [setAway] = useMutation(SET_AWAY);

  const handleToggleAFK = () => {
    muteAway(muted, away, voiceToggle);
    setAway({
      variables: {
        away: !away,
      },
    });
  };

  const handleLocalStreamInactive = ({ id }: { id: string }) => {
    if (
      currentVideoStream.current
      && typeof id === 'string'
      && currentVideoStream.current?.mediaStream?.id === id
    ) {
      setIsCameraLoading(true);
      handlePreviewError(
        'stream_inactive',
        new Error('inactiveError'),
        '- preview camera stream inactive',
      );
    }
  };

  const handlePreviewError = (
    logCode: string,
    error: Error,
    description: string,
  ) => {
    logger.warn(
      {
        logCode: `video_preview_${logCode}_error`,
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      },
      `Error ${description}`,
    );
    setPreviewError(handleGUMError(error));
  };

  const handleGUMError = (error: Error) => {
    logger.error(
      {
        logCode: 'video_preview_gum_failure',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      },
      'getUserMedia failed in video-preview',
    );

    const intlError = intlMessages[error.name] || intlMessages[error.message];
    if (intlError) {
      return formatMessage(intlError);
    }

    return formatMessage(intlMessages.genericError, {
      0: `${error.name}: ${error.message}`,
    });
  };

  const handleDeviceError = (
    logCode: string,
    error: Error,
    description: string,
  ) => {
    logger.warn(
      {
        logCode: `video_preview_${logCode}_error`,
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      },
      `Error ${description}`,
    );
    setViewState(VIEW_STATES.error);
    setDeviceError(handleGUMError(error));
  };

  const terminateCameraStream = (stream: BBBVideoStream | null, deviceId: string | null) => {
    if (stream) {
      // Stream is being destroyed - remove gUM revocation handler to avoid false negatives
      stream.removeListener('inactive', handleLocalStreamInactive);
      PreviewService.terminateCameraStream(stream, deviceId);
    }
  };

  const setCurrentVideoStream = (bbbVideoStream: BBBVideoStream | null) => {
    if (currentVideoStream.current) {
      currentVideoStream.current.removeListener(
        'inactive',
        handleLocalStreamInactive,
      );
    }
    if (bbbVideoStream) {
      // This causes a preview crash in firefox, review it
      // bbbVideoStream.once('inactive', handleLocalStreamInactive);
    }
    currentVideoStream.current = bbbVideoStream;
  };

  const cleanupStreamAndVideo = () => {
    setCurrentVideoStream(null);
    if (videoRef.current) videoRef.current.srcObject = null;
  };

  const displayPreview = () => {
    if (currentVideoStream.current && videoRef.current) {
      videoRef.current.srcObject = currentVideoStream.current.mediaStream;
    }
  };

  const updateDeviceId = (deviceId: string | null) => {
    let actualDeviceId = deviceId;

    if (!actualDeviceId && currentVideoStream.current) {
      actualDeviceId = MediaStreamUtils.extractDeviceIdFromStream(
        currentVideoStream.current.mediaStream,
        'video',
      );
    }

    setWebcamDeviceId(actualDeviceId);
    return actualDeviceId;
  };

  const getCameraStream = async (deviceId: string | null, profile: CameraProfileProps) => {
    setSelectedProfile(profile.id);
    setPreviewError(null);
    setIsCameraLoading(true);

    terminateCameraStream(currentVideoStream.current, webcamDeviceId);
    cleanupStreamAndVideo();

    try {
      // The return of doGUM is an instance of BBBVideoStream (a thin wrapper over a MediaStream)
      let bbbVideoStream = await PreviewService.doGUM(deviceId, profile);
      setCurrentVideoStream(bbbVideoStream);
      const updatedDevice = updateDeviceId(deviceId);

      if (updatedDevice !== deviceId) {
        bbbVideoStream = await PreviewService.doGUM(updatedDevice, profile);
        setCurrentVideoStream(bbbVideoStream);
      }
    } catch (error) {
      handlePreviewError(
        'do_gum_preview',
        error as Error,
        'displaying final selection',
      );
    }

    // Restore virtual background if it was stored in Local/Session Storage
    try {
      await applyStoredVirtualBg(deviceId);
    } finally {
      // Late VBG resolve, clean up tracks, stop.
      if (!isMounted.current) {
        terminateCameraStream(currentVideoStream.current, deviceId);
        cleanupStreamAndVideo();
      }
      setIsCameraLoading(false);
    }
  };

  const applyStoredVirtualBg = async (deviceId?: string | null) => {
    const webcamDeviceIdToUse = deviceId || webcamDeviceId;

    const virtualBackground = getSessionVirtualBackgroundInfo(webcamDeviceIdToUse);

    if (virtualBackground) {
      // @ts-ignore
      const { type, name, uniqueId } = virtualBackground;
      let customParams;

      if (uniqueId) {
        const { backgrounds } = customVirtualBackgroundsContext;
        const background = backgrounds[uniqueId]
          || Object.values(backgrounds).find(
            (bg : any) => bg.uniqueId === uniqueId, // TODO: typing
          );

        if (background && background.data) {
          customParams = {
            uniqueId,
            file: background.data,
          };
        } else {
          handleVirtualBgError(
            new Error('Missing virtual background data'),
            type,
            name,
          );
          removeSessionVirtualBackgroundInfo(webcamDeviceIdToUse);
          throw new Error('Virtual background data missing');
        }

        await handleVirtualBgSelected(type, name, customParams);
      } else {
        await handleVirtualBgSelected(type, name);
      }
    }
  };

  const handleSelectWebcam = async (event: SelectChangeEvent<unknown>) => {
    const webcamValue = event.target.value as string;

    await getCameraStream(webcamValue, PreviewService.getDefaultProfile());
    displayPreview();
  };

  const handleSelectProfile = async (event: SelectChangeEvent<unknown>) => {
    const profileValue = event.target.value as string;

    const selectedProfile = PreviewService.getCameraProfile(profileValue) as CameraProfileProps;
    await getCameraStream(webcamDeviceId, selectedProfile);
    displayPreview();
  };

  const handleVirtualBgError = (error: Error, type: string, name: string | undefined) => {
    logger.error(
      {
        logCode: 'video_preview_virtualbg_error',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
          errorStack: error.stack,
          virtualBgType: type,
          virtualBgName: name,
        },
      },
      `Failed to toggle virtual background: ${error.message}`,
    );

    notify(formatMessage(intlMessages.virtualBgGenericError), 'error', 'video');
  };

  const handleVirtualBgSelected = async (
    type: string,
    name: string,
    customParams?: { uniqueId: string; file: Blob },
  ) => {
    const shared = isAlreadyShared(webcamDeviceId as string);
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (
      type !== EFFECT_TYPES.NONE_TYPE
      || (CAMERA_BRIGHTNESS_AVAILABLE && brightness !== 100)
    ) {
      const switched = await startVirtualBackground(
        currentVideoStream.current,
        type,
        name,
        customParams,
      );
      if (switched) updateVirtualBackgroundInfo();
      setVirtualBackgroundChecked(true);
      return switched;
    }
    stopVirtualBackground(currentVideoStream.current);
    if (shared) updateVirtualBackgroundInfo();
    return true;
  };

  const stopVirtualBackground = (bbbVideoStream: BBBVideoStream | null) => {
    if (bbbVideoStream) {
      bbbVideoStream.stopVirtualBackground();
      displayPreview();
    }
  };

  const updateVirtualBackgroundInfo = () => {
    if (currentVideoStream.current) {
      setSessionVirtualBackgroundInfo(
        webcamDeviceId,
        currentVideoStream.current.virtualBgType,
        currentVideoStream.current.virtualBgName,
        currentVideoStream.current.virtualBgUniqueId,
      );
    }
  };

  const isAlreadyShared = (webcamId: string) => {
    return sharedDevices.includes(webcamId);
  };

  const startVirtualBackground = async (
    bbbVideoStream: BBBVideoStream | null,
    type: string,
    name?: string,
    customParams?: { uniqueId: string; file: Blob },
  ) => {
    setIsCameraLoading(true);
    if (!bbbVideoStream) return false;

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
  };

  const startCameraBrightness = async () => {
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (CAMERA_BRIGHTNESS_AVAILABLE && currentVideoStream.current) {
      const setBrightnessInfo = () => {
        const stream = currentVideoStream.current as BBBVideoStream || {};
        const service = stream.virtualBgService || {};
        const {
          brightness: currentBrightness = 100,
          wholeImageBrightness: currentWholeImageBrightness = false,
        } = service;
        setBrightness(currentBrightness);
        setWholeImageBrightness(currentWholeImageBrightness);
      };

      if (!currentVideoStream.current.virtualBgService) {
        const switched = await startVirtualBackground(
          currentVideoStream.current,
          EFFECT_TYPES.NONE_TYPE,
        );
        if (switched) setBrightnessInfo();
      } else {
        setBrightnessInfo();
      }
    }
  };

  const setCameraBrightness = async (brightnessValue: number) => {
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    const CAMERA_BRIGHTNESS_AVAILABLE = ENABLE_CAMERA_BRIGHTNESS && isVirtualBackgroundSupported();

    if (CAMERA_BRIGHTNESS_AVAILABLE && currentVideoStream.current) {
      if (currentVideoStream.current.virtualBgService == null) {
        await startCameraBrightness();
      }

      currentVideoStream.current.changeCameraBrightness(brightnessValue);
      setBrightness(brightnessValue);
    }
  };

  // Unused for now, but will be used in the future when UI/UX for sharing
  // through the profile settings is implemented - prlanzarin
  const handleStartSharing = async () => {
    if (!currentVideoStream.current) return;
    if (
      !PreviewService.storeStream(webcamDeviceId, currentVideoStream.current)
    ) {
      currentVideoStream.current.stop();
    }

    if (
      currentVideoStream.current.virtualBgService
      && brightness === 100
      && currentVideoStream.current.virtualBgType === EFFECT_TYPES.NONE_TYPE
    ) {
      stopVirtualBackground(currentVideoStream.current);
    }

    PreviewService.changeProfile(selectedProfile);
    PreviewService.changeWebcam(webcamDeviceId);
    updateVirtualBackgroundInfo();
    cleanupStreamAndVideo();
    if (!isAlreadyShared(webcamDeviceId as string)) {
      VideoService.joinVideo(webcamDeviceId as string, isCamLocked);
    }
  };

  useEffect(() => {
    // Code to run on mount
    isMounted.current = true;
    if (deviceInfo.hasMediaDevices) {
      navigator.mediaDevices.enumerateDevices().then(async (devices) => {
        VideoService.updateNumberOfDevices(devices);
        // Late enumerateDevices resolution, stop.
        if (!isMounted) return;

        let {
          webcams,
          // eslint-disable-next-line prefer-const
          areLabelled,
          // eslint-disable-next-line prefer-const
          areIdentified,
        } = PreviewService.digestVideoDevices(devices, webcamDeviceId);

        logger.debug({
          logCode: 'video_preview_enumerate_devices',
          extraInfo: {
            devices,
            webcams,
          },
        }, `Enumerate devices came back. There are ${devices.length} devices and ${webcams.length} are video inputs`);

        if (webcams.length > 0) {
          // @ts-ignore
          await getCameraStream(webcams[0].deviceId, PreviewService.getDefaultProfile());
          // Late gUM resolve, stop.
          if (!isMounted) return;

          if (!areLabelled || !areIdentified) {
            // If they aren't labelled or have nullish deviceIds, run
            // enumeration again and get their full versions
            // Why: fingerprinting countermeasures obfuscate those when
            // no permission was granted via gUM
            try {
              const newDevices = await navigator.mediaDevices.enumerateDevices();
              webcams = PreviewService.digestVideoDevices(newDevices, webcamDeviceId).webcams;
            } catch (error: unknown) {
              // Not a critical error beucase it should only affect UI; log it
              // and go ahead
              logger.error({
                logCode: 'video_preview_enumerate_relabel_failure',
                extraInfo: {
                  errorName: (error as Error).name, errorMessage: (error as Error).message,
                },
              }, 'enumerateDevices for relabelling failed');
            }
          }

          setAvailableWebcams(webcams);
          setViewState(VIEW_STATES.found);
          displayPreview();
        } else {
          // There were no webcams coming from enumerateDevices. Throw an error.
          const noWebcamsError = new Error('NotFoundError');
          handleDeviceError('enumerate', noWebcamsError, ': no webcams found');
        }
      }).catch((error) => {
        // enumerateDevices failed
        handleDeviceError('enumerate', error, 'enumerating devices');
      });
    } else {
      // Top-level navigator.mediaDevices is not supported.
      // The session went through the version checking, but somehow ended here.
      // Nothing we can do.
      const error = new Error('NotSupportedError');
      handleDeviceError('mount', error, ': navigator.mediaDevices unavailable');
    }

    return () => {
      // Code to run on unmount
      terminateCameraStream(currentVideoStream.current, webcamDeviceId);
      cleanupStreamAndVideo();
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    // ComponentDidUpdate logic
    if (
      viewState === VIEW_STATES.found
      && !videoRef.current?.srcObject
    ) {
      displayPreview();
    }
  }, [viewState]);

  useEffect(() => {
    if (!virtualBackgroundChecked) {
      handleVirtualBgSelected(EFFECT_TYPES.NONE_TYPE, 'None');
    }
  }, [virtualBackgroundChecked]);

  function renderWebcamPreview(): React.ReactNode {
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
          <Styled.VideoPreviewContent>
            <Styled.VideoCol>
              <div style={containerStyle}>
                <span>{formatMessage(intlMessages.findingWebcamsLabel)}</span>
                <Styled.FetchingAnimation animations={animations} />
              </div>
            </Styled.VideoCol>
          </Styled.VideoPreviewContent>
        );
      case VIEW_STATES.error:
        return (
          <Styled.VideoPreviewContent>
            <Styled.VideoCol><div>{deviceError}</div></Styled.VideoCol>
          </Styled.VideoPreviewContent>
        );
      case VIEW_STATES.found:
      default:
        return (
          <Styled.VideoPreviewContent>
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
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                    />
                  )
              }
            </Styled.VideoCol>
            {/* this.renderTabsContent(selectedTab) */}
          </Styled.VideoPreviewContent>
        );
    }
  }

  function renderQualitySelector(): React.ReactNode {
    const CAMERA_PROFILES = window.meetingClientSettings.public.kurento.cameraProfiles || [];
    // Filtered, without hidden profiles
    const PREVIEW_CAMERA_PROFILES = CAMERA_PROFILES.filter((p) => !p.hidden);
    return (
      <Styled.CameraQualityContainer>
        <Styled.CameraQualityText>
          {formatMessage(intlMessages.qualityLabel)}
        </Styled.CameraQualityText>
        {PREVIEW_CAMERA_PROFILES.length > 0
          ? (
            <Styled.CameraQualitySelector
              value={selectedProfile || ''}
              onChange={handleSelectProfile}
              IconComponent={ExpandMoreIcon}
            >
              {PREVIEW_CAMERA_PROFILES.map((profile) => {
                // @ts-ignore
                const label = intlMessages[`${profile.id}`]
                  // @ts-ignore
                  ? formatMessage(intlMessages[`${profile.id}`])
                  : profile.name;

                return (
                  <MenuItem key={profile.id} value={profile.id}>
                    {label}
                  </MenuItem>
                );
              })}
            </Styled.CameraQualitySelector>
          )
          : (
            <span>
              {formatMessage(intlMessages.profileNotFoundLabel)}
            </span>
          )}
      </Styled.CameraQualityContainer>
    );
  }

  const renderBrightnessInput = () => {
    const ENABLE_CAMERA_BRIGHTNESS = window.meetingClientSettings.public.app.enableCameraBrightness;
    if (!ENABLE_CAMERA_BRIGHTNESS) return null;

    return (
      <Slider
        value={brightness - 100}
        defaultValue={0}
        min={-100}
        max={100}
        // size="small"
        onChange={(_, value) => setCameraBrightness((value as number) + 100)}
        aria-describedby="brightness-slider-desc"
        valueLabelDisplay="auto"
        disabled={!isVirtualBackgroundSupported() || isCameraLoading}
        sx={{
          color: colorPrimary,
        }}
      />
    );
  };

  const renderVirtualBgSelector = (): JSX.Element => {
    const initialVirtualBgState = currentVideoStream.current
      ? {
        type: currentVideoStream.current.virtualBgType,
        name: currentVideoStream.current.virtualBgName,
        uniqueId: currentVideoStream.current.virtualBgUniqueId,
      }
      : getSessionVirtualBackgroundInfoWithDefault(webcamDeviceId);

    const SHOW_THUMBNAILS = window.meetingClientSettings.public.virtualBackgrounds?.showThumbnails ?? true;

    return (
      <>
        <Styled.SwitchTitle
          sx={{ margin: 0 }}
          control={(
            <Styled.MaterialSwitch
              sx={{ marginRight: '1rem' }}
              checked={virtualBackgroundChecked}
              onChange={(_, checked) => {
                setVirtualBackgroundChecked(checked);
              }}
              disabled={!isVirtualBackgroundsEnabled || isCameraLoading}
            />
          )}
          label={formatMessage(intlMessages.webcamVirtualBackgroundTitle)}
        />
        {virtualBackgroundChecked
          && (
            <Styled.VirtualBgSelectorBorder>
              <VirtualBgSelector
                handleVirtualBgSelected={handleVirtualBgSelected}
                locked={isCameraLoading}
                showThumbnails={SHOW_THUMBNAILS}
                initialVirtualBgState={initialVirtualBgState}
                isCustomVirtualBackgroundsEnabled={isCustomVirtualBackgroundsEnabled}
                renderSettingsLabel={false}
              />
            </Styled.VirtualBgSelectorBorder>
          )}
      </>
    );
  };

  return (
    <>
      <Styled.HeaderContainer
        isRTL={isRTL}
        data-test="profileSettingsTitle"
        title={formatMessage(intlMessages.title)}
        leftButtonProps={{}}
        rightButtonProps={{
          'aria-label': formatMessage(intlMessages.closeLabel),
          'data-test': 'closeProfileSettings',
          icon: 'close',
          label: formatMessage(intlMessages.closeLabel),
          onClick: () => {
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_IS_OPEN,
              value: false,
            });
            layoutContextDispatch({
              type: ACTIONS.SET_SIDEBAR_CONTENT_PANEL,
              value: PANELS.NONE,
            });
          },
        }}
        customRightButton={null}
      />
      <Styled.Separator />
      <Styled.ProfileSettings>
        {renderWebcamPreview()}
        <Styled.UsernameContainer>
          <Styled.UsernameTitle>{formatMessage(intlMessages.username)}</Styled.UsernameTitle>
          <Styled.Username>{currentUserData?.name ?? ''}</Styled.Username>
        </Styled.UsernameContainer>
        <Styled.UserPresenceRoot>
          <Styled.UserPresenceContainer>
            <Styled.UserPresenceButton active={!currentUserData?.away} onClick={handleToggleAFK}>
              <Styled.UserPresenceText>{formatMessage(intlMessages.activeLabel)}</Styled.UserPresenceText>
            </Styled.UserPresenceButton>
            <Styled.UserPresenceDivider />
            <Styled.UserPresenceButton active={currentUserData?.away} onClick={handleToggleAFK}>
              <Styled.UserPresenceText>{formatMessage(intlMessages.awayLabel)}</Styled.UserPresenceText>
            </Styled.UserPresenceButton>
          </Styled.UserPresenceContainer>
        </Styled.UserPresenceRoot>
        <Styled.Separator />
        <Styled.DevicesSettingsContainer>
          <AudioSelectors inAudio={!!currentUserData?.voice} />
          <Styled.DeviceContainer>
            <Styled.IconCamera />
            {availableWebcams && availableWebcams.length > 0
              ? (
                <Styled.DeviceSelector value={webcamDeviceId || ''} onChange={handleSelectWebcam} IconComponent={ExpandMoreIcon}>
                  {availableWebcams.map((webcam, index) => (
                    <MenuItem key={webcam.deviceId} value={webcam.deviceId}>
                      {webcam.label || `${formatMessage(intlMessages.cameraLabel)} ${index}`}
                    </MenuItem>
                  ))}
                </Styled.DeviceSelector>
              )
              : <span>{formatMessage(intlMessages.webcamNotFoundLabel)}</span>}
          </Styled.DeviceContainer>
          <Styled.DeviceContainer>
            <Styled.WbSunnyIcon />
            {renderBrightnessInput()}
          </Styled.DeviceContainer>
          {renderQualitySelector()}
        </Styled.DevicesSettingsContainer>
        <Styled.Separator />
        <Styled.VirtualBackgroundContainer>
          {isVirtualBackgroundsEnabled && renderVirtualBgSelector()}
        </Styled.VirtualBackgroundContainer>
        <AudioCaptions />
      </Styled.ProfileSettings>
    </>
  );
};

export default ProfileSettings;
