import React from 'react';
import { useMutation } from '@apollo/client';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/video-provider-graphql/service';
import ScreenShareService from '/imports/ui/components/screenshare/service';
import logger from '/imports/startup/client/logger';
import { SCREENSHARING_ERRORS } from '/imports/api/screenshare/client/bridge/errors';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import { CAMERA_BROADCAST_STOP } from '../video-provider/mutations';
import {
  useSharedDevices, useHasVideoStream, useHasCapReached, useIsUserLocked, useStreams,
  useExitVideo,
} from '/imports/ui/components/video-provider/video-provider-graphql/hooks';

const VideoPreviewContainer = (props) => {
  const {
    buildStartSharingCameraAsContent,
    buildStopSharing,
    hasCapReached,
    ...rest
  } = props;
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);

  const sendUserUnshareWebcam = (cameraId) => {
    cameraBroadcastStop({ variables: { cameraId } });
  };

  const { streams } = useStreams();
  const exitVideo = useExitVideo()
  const startSharingCameraAsContent = buildStartSharingCameraAsContent(stopExternalVideoShare);
  const stopSharing = buildStopSharing(sendUserUnshareWebcam, streams, exitVideo);
  const sharedDevices = useSharedDevices();
  const hasVideoStream = useHasVideoStream();
  const camCapReached = useHasCapReached();
  const isCamLocked = useIsUserLocked();
  

  return (
    <VideoPreview
      {...{
        startSharingCameraAsContent,
        stopSharing,
        sharedDevices,
        hasVideoStream,
        camCapReached,
        isCamLocked,
        ...rest,
      }}
    />
  );
};

export default withTracker(({ setIsOpen, callbackToClose }) => ({
  startSharing: (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    VideoService.joinVideo(deviceId);
  },
  buildStartSharingCameraAsContent: (stopExternalVideoShare) => (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    const handleFailure = (error) => {
      const {
        errorCode = SCREENSHARING_ERRORS.UNKNOWN_ERROR.errorCode,
        errorMessage = error.message,
      } = error;

      logger.error({
        logCode: 'camera_as_content_failed',
        extraInfo: { errorCode, errorMessage },
      }, `Sharing camera as content failed: ${errorMessage} (code=${errorCode})`);

      ScreenShareService.screenshareHasEnded();
    };
    ScreenShareService.shareScreen(
      stopExternalVideoShare,
      true, handleFailure, { stream: Service.getStream(deviceId)._mediaStream },
    );
    ScreenShareService.setCameraAsContentDeviceId(deviceId);
  },
  buildStopSharing: (sendUserUnshareWebcam, streams, exitVideo) => (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    if (deviceId) {
      const streamId = VideoService.getMyStreamId(deviceId, streams);
      if (streamId) VideoService.stopVideo(streamId, sendUserUnshareWebcam, streams);
    } else {
      exitVideo(sendUserUnshareWebcam, streams);
    }
  },
  stopSharingCameraAsContent: () => {
    callbackToClose();
    setIsOpen(false);
    ScreenShareService.screenshareHasEnded();
  },
  cameraAsContentDeviceId: ScreenShareService.getCameraAsContentDeviceId(),
  closeModal: () => {
    callbackToClose();
    setIsOpen(false);
  },
  webcamDeviceId: Service.webcamDeviceId(),
}))(VideoPreviewContainer);
