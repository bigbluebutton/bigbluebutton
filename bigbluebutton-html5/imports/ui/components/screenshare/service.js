import { makeVar, useReactiveVar } from '@apollo/client';
import {
  sfuScreenShareBridge,
  liveKitScreenShareBridge,
} from '/imports/api/screenshare/client/bridge';
import BridgeService from '/imports/api/screenshare/client/bridge/service';
import logger from '/imports/startup/client/logger';
import AudioService from '/imports/ui/components/audio/service';
import MediaStreamUtils from '/imports/utils/media-stream-utils';
import browserInfo from '/imports/utils/browserInfo';
import { SCREENSHARE_SUBSCRIPTION } from './queries';
import useDeduplicatedSubscription from '../../core/hooks/useDeduplicatedSubscription';
import useMeeting from '../../core/hooks/useMeeting';

let screenShareBridge = sfuScreenShareBridge;

export const setBridge = (bridgeName) => {
  switch (bridgeName) {
    case 'bbb-webrtc-sfu':
      screenShareBridge = sfuScreenShareBridge;
      break;
    case 'livekit':
      screenShareBridge = liveKitScreenShareBridge;
      break;
    default:
      logger.warn({
        logCode: 'screenshare_unknown_bridge',
        extraInfo: {
          targetBridge: bridgeName,
        },
      }, `Unknown screenshare bridge: ${bridgeName}`);
      // Hardcoded default is bbb-webrtc-sfu
      screenShareBridge = sfuScreenShareBridge;
      break;
  }

  logger.debug({
    logCode: 'screenshare_bridge_set',
    extraInfo: {
      targetBridge: bridgeName,
      bridge: screenShareBridge?.bridgeName,
    },
  }, `Screenshare bridge set to ${screenShareBridge?.bridgeName}`);

  return screenShareBridge;
};

export const SCREENSHARE_MEDIA_ELEMENT_NAME = 'screenshareVideo';

export const DEFAULT_SCREENSHARE_STATS_TYPES = [
  'outbound-rtp',
  'inbound-rtp',
];

export const CONTENT_TYPE_CAMERA = 'camera';
export const CONTENT_TYPE_SCREENSHARE = 'screenshare';

export const isSharingVar = makeVar(false);
export const sharingContentTypeVar = makeVar(false);
export const cameraAsContentDeviceIdTypeVar = makeVar('');

export const useScreenshare = () => {
  const {
    data: meeting,
    loading: meetingLoading,
  } = useMeeting((m) => ({
    componentsFlags: m.componentsFlags,
  }));

  const { data, loading, error } = useDeduplicatedSubscription(
    SCREENSHARE_SUBSCRIPTION,
    {
      skip: meetingLoading
      || !(meeting?.componentsFlags?.hasScreenshare || meeting.componentsFlags?.hasCameraAsContent),
    },
  );

  return {
    data: data?.screenshare || [],
    loading,
    error,
  };
};

export const useIsSharing = () => useReactiveVar(isSharingVar);
export const useSharingContentType = () => useReactiveVar(sharingContentTypeVar);
export const useCameraAsContentDeviceIdType = () => useReactiveVar(cameraAsContentDeviceIdTypeVar);

export const isSharing = () => isSharingVar();

export const setIsSharing = (sharing) => {
  if (isSharing() !== sharing) {
    isSharingVar(sharing);
  }
};

export const getSharingContentType = () => sharingContentTypeVar();

export const setSharingContentType = (contentType) => {
  if (getSharingContentType() !== contentType) {
    sharingContentTypeVar(contentType);
  }
};

export const getCameraAsContentDeviceId = () => cameraAsContentDeviceIdTypeVar();

export const setCameraAsContentDeviceId = (deviceId) => {
  if (getCameraAsContentDeviceId() !== deviceId) {
    cameraAsContentDeviceIdTypeVar(deviceId);
  }
};

export const _trackStreamTermination = (stream, handler) => {
  if (typeof stream !== 'object' || typeof handler !== 'function') {
    throw new TypeError('Invalid trackStreamTermination arguments');
  }
  let _handler = handler;

  // Dirty, but effective way of checking whether the browser supports the 'inactive'
  // event. If the oninactive interface is null, it can be overridden === supported.
  // If undefined, it's not; so we fallback to the track 'ended' event.
  // The track ended listener should probably be reviewed once we create
  // thin wrapper classes for MediaStreamTracks as well, because we'll want a single
  // media stream holding multiple tracks in the future
  if (stream.oninactive !== undefined) {
    if (typeof stream.oninactive === 'function') {
      const oldHandler = stream.oninactive;
      _handler = () => {
        oldHandler();
        handler();
      };
    }
    stream.addEventListener('inactive', handler, { once: true });
  } else {
    const track = MediaStreamUtils.getVideoTracks(stream)[0];
    if (track) {
      track.addEventListener('ended', handler, { once: true });
      if (typeof track.onended === 'function') {
        const oldHandler = track.onended;
        _handler = () => {
          oldHandler();
          handler();
        };
      }
      track.onended = _handler;
    }
  }
};

export const _isStreamActive = (stream) => {
  const tracksAreActive = !stream.getTracks().some((track) => track.readyState === 'ended');

  return tracksAreActive && stream.active;
};

export const useIsScreenGloballyBroadcasting = () => {
  const { data, loading } = useScreenshare();

  return {
    screenIsShared: Boolean(
      data
    && data[0]
    && data[0].contentType === CONTENT_TYPE_SCREENSHARE
    && data[0].stream,
    ),
    loading,
  };
};

export const useIsCameraAsContentGloballyBroadcasting = () => {
  const { data } = useScreenshare();

  return Boolean(data && data[0] && data[0].contentType === CONTENT_TYPE_CAMERA && data[0].stream);
};

export const useIsScreenBroadcasting = () => {
  const active = useIsSharing();
  const sharingContentType = useSharingContentType();
  const { screenIsShared } = useIsScreenGloballyBroadcasting();
  const sharing = active && sharingContentType === CONTENT_TYPE_SCREENSHARE;

  return sharing || screenIsShared;
};

export const useIsCameraAsContentBroadcasting = () => {
  const active = useIsSharing();
  const sharingContentType = useSharingContentType();
  const sharing = active && sharingContentType === CONTENT_TYPE_CAMERA;
  const cameraAsContentIsShared = useIsCameraAsContentGloballyBroadcasting();

  return sharing || cameraAsContentIsShared;
};

export const useScreenshareHasAudio = () => {
  const { data } = useScreenshare();

  return Boolean(data && data[0] && data[0].hasAudio);
};

export const useBroadcastContentType = () => {
  const { data } = useScreenshare();

  if (!data || !data[0]) {
    // defaults to contentType: "camera"
    return CONTENT_TYPE_CAMERA;
  }

  return data[0].contentType;
};

export const useScreenshareStreamId = () => {
  const { data } = useScreenshare();

  return data?.[0]?.stream;
};

export const screenshareHasEnded = () => {
  if (isSharingVar()) {
    setIsSharing(false);
  }
  if (getSharingContentType() === CONTENT_TYPE_CAMERA) {
    setCameraAsContentDeviceId('');
  }

  screenShareBridge.stop();
};

export const _handleStreamTermination = () => {
  screenshareHasEnded();
};

export const getMediaElement = () => document.getElementById(SCREENSHARE_MEDIA_ELEMENT_NAME);

export const getMediaElementDimensions = () => {
  const element = getMediaElement();
  return {
    width: element?.videoWidth ?? 0,
    height: element?.videoHeight ?? 0,
  };
};

export const setStreamEnabled = (enabled) => {
  screenShareBridge.setStreamEnabled(enabled);
};

export const setVolume = (volume) => {
  screenShareBridge.setVolume(volume);
};

export const getVolume = () => screenShareBridge.getVolume();

export const useShouldEnableVolumeControl = () => {
  const SCREENSHARE_CONFIG = window.meetingClientSettings.public.kurento.screenshare;
  const VOLUME_CONTROL_ENABLED = SCREENSHARE_CONFIG.enableVolumeControl;
  const hasAudio = useScreenshareHasAudio();

  return VOLUME_CONTROL_ENABLED && hasAudio;
};

export const useShowButtonForNonPresenters = () => {
  const MEDIA_CONFIG = window.meetingClientSettings.public.kurento;

  return MEDIA_CONFIG.screenshare.showButtonForNonPresenters;
};

export const attachLocalPreviewStream = (mediaElement) => {
  const { isTabletApp } = browserInfo;
  if (isTabletApp) {
    // We don't show preview for mobile app, as the stream is only available in native code
    return;
  }
  const stream = screenShareBridge.gdmStream;
  if (stream && mediaElement) {
    // Always muted, presenter preview.
    BridgeService.screenshareLoadAndPlayMediaStream(stream, mediaElement, true);
  }
};

export const setOutputDeviceId = (outputDeviceId) => {
  const screenShareElement = document.getElementById(SCREENSHARE_MEDIA_ELEMENT_NAME);
  const sinkIdSupported = screenShareElement && typeof screenShareElement.setSinkId === 'function';
  const srcStream = screenShareElement?.srcObject;

  if (typeof outputDeviceId === 'string'
    && sinkIdSupported
    && screenShareElement.sinkId !== outputDeviceId
    && srcStream
    && srcStream.getAudioTracks().length > 0) {
    try {
      screenShareElement.setSinkId(outputDeviceId);
      logger.debug({
        logCode: 'screenshare_output_device_change',
        extraInfo: {
          newDeviceId: outputDeviceId,
        },
      }, `Screenshare output device changed: to ${outputDeviceId || 'default'}`);
    } catch (error) {
      logger.error({
        logCode: 'screenshare_output_device_change_failure',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
          newDeviceId: outputDeviceId,
        },
      }, `Error changing screenshare output device - {${error.name}: ${error.message}}`);
    }
  }
};

export const shareScreen = async (
  isCameraAsContentBroadcasting,
  stopWatching,
  isPresenter,
  onFail,
  options = {},
) => {
  if (isCameraAsContentBroadcasting) {
    screenshareHasEnded();
  }

  try {
    let stream;
    let contentType = CONTENT_TYPE_SCREENSHARE;
    if (options.stream == null) {
      stream = await BridgeService.getScreenStream();
    } else {
      contentType = CONTENT_TYPE_CAMERA;
      stream = options.stream;
    }
    _trackStreamTermination(stream, _handleStreamTermination);

    if (!isPresenter) {
      MediaStreamUtils.stopMediaStreamTracks(stream);
      return;
    }

    await screenShareBridge.share(stream, onFail, contentType);

    // Stream might have been disabled in the meantime. I love badly designed
    // async components like this screen sharing bridge :) - prlanzarin 09 May 22
    if (!_isStreamActive(stream)) {
      _handleStreamTermination();
      return;
    }

    // stop external video share if running
    stopWatching();

    setSharingContentType(contentType);
    setIsSharing(true);
  } catch (error) {
    onFail(error);
  }
};

export const viewScreenshare = (streamId, hasAudio, options = {}) => {
  screenShareBridge.view(streamId, { hasAudio, outputDeviceId: options.outputDeviceId })
    .catch((error) => {
      logger.error({
        logCode: 'screenshare_view_failed',
        extraInfo: {
          errorName: error.name,
          errorMessage: error.message,
        },
      }, 'Screenshare viewer failure');
    });
};

export const screenshareHasStarted = (streamId, hasAudio, isPresenter, options = {}) => {
  // Presenter's screen preview is local, so skip
  if (!isPresenter) {
    viewScreenshare(streamId, hasAudio, { outputDeviceId: options.outputDeviceId });
  }
};

export const screenShareEndAlert = () => AudioService
  .playAlertSound(`${window.meetingClientSettings.public.app.cdn
    + window.meetingClientSettings.public.app.basename}`
    + '/resources/sounds/ScreenshareOff.mp3');

/**
   * Get stats about all active screenshare peers.
   *
   * For more information see:
   *  - https://developer.mozilla.org/en-US/docs/Web/API/RTCPeerConnection/getStats
   *  - https://developer.mozilla.org/en-US/docs/Web/API/RTCStatsReport

   * @param {Array[String]} statsType - An array containing valid RTCStatsType
   *                                    values to include in the return object
   *
   * @returns {Object} The information about each active screen sharing peer.
   *          The returned format follows the format returned by video's service
   *          getStats, which considers more than one peer connection to be returned.
   *          The format is given by:
   *          {
   *            peerIdString: RTCStatsReport
   *          }
   */
export const getStats = async (statsTypes = DEFAULT_SCREENSHARE_STATS_TYPES) => {
  const screenshareStats = {};
  let stats = null;

  if (typeof screenShareBridge.getStats === 'function') {
    stats = await screenShareBridge.getStats();
  } else {
    const peer = screenShareBridge.getPeerConnection();

    if (!peer) return null;

    stats = await peer.getStats();
  }

  if (!stats) return null;

  stats.forEach((stat) => {
    if (statsTypes.includes(stat.type) && (!stat.kind || stat.kind === 'video')) {
      screenshareStats[stat.type] = stat;
    }
  });

  return { screenshareStats };
};

export default {
  SCREENSHARE_MEDIA_ELEMENT_NAME,
  screenshareHasEnded,
  screenshareHasStarted,
  shareScreen,
  screenShareEndAlert,
  isSharing,
  setIsSharing,
  setSharingContentType,
  getSharingContentType,
  getMediaElement,
  getMediaElementDimensions,
  attachLocalPreviewStream,
  getStats,
  setVolume,
  getVolume,
  setCameraAsContentDeviceId,
  getCameraAsContentDeviceId,
  setBridge,
  setOutputDeviceId,
  useCameraAsContentDeviceIdType,
  useIsSharing,
  useSharingContentType,
  useIsScreenGloballyBroadcasting,
  useIsCameraAsContentGloballyBroadcasting,
  useShouldEnableVolumeControl,
  useShowButtonForNonPresenters,
  useIsScreenBroadcasting,
  useIsCameraAsContentBroadcasting,
  useScreenshareHasAudio,
  useBroadcastContentType,
  useScreenshareStreamId,
};
