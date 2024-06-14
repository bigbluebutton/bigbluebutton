import React from 'react';
import { useMutation } from '@apollo/client';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import VideoPreview from './component';
import VideoService from '../video-provider/video-provider-graphql/service';
import * as ScreenShareService from '/imports/ui/components/screenshare/service';
import logger from '/imports/startup/client/logger';
import { SCREENSHARING_ERRORS } from '/imports/api/screenshare/client/bridge/errors';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import {
  useSharedDevices, useHasVideoStream, useHasCapReached, useIsUserLocked, useStreams,
  useExitVideo,
  useStopVideo,
} from '/imports/ui/components/video-provider/video-provider-graphql/hooks';
import { useStorageKey } from '../../services/storage/hooks';

const VideoPreviewContainer = (props) => {
  const {
    callbackToClose,
    setIsOpen,
  } = props;
  const cameraAsContentDeviceId = ScreenShareService.useCameraAsContentDeviceIdType();
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);

  const { streams } = useStreams();
  const exitVideo = useExitVideo();
  const stopVideo = useStopVideo();
  const sharedDevices = useSharedDevices();
  const hasVideoStream = useHasVideoStream();
  const camCapReached = useHasCapReached();
  const isCamLocked = useIsUserLocked();
  const webcamDeviceId = useStorageKey('WebcamDeviceId');

  const stopSharing = (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    if (deviceId) {
      const streamId = VideoService.getMyStreamId(deviceId, streams);
      if (streamId) stopVideo(streamId);
    } else {
      exitVideo();
    }
  };

  const startSharingCameraAsContent = (deviceId) => {
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
  };

  const startSharing = (deviceId) => {
    callbackToClose();
    setIsOpen(false);
    VideoService.joinVideo(deviceId);
  };

  const stopSharingCameraAsContent = () => {
    callbackToClose();
    setIsOpen(false);
    ScreenShareService.screenshareHasEnded();
  };

  const closeModal = () => {
    callbackToClose();
    setIsOpen(false);
  };

  return (
    <VideoPreview
      {...{
        stopSharingCameraAsContent,
        closeModal,
        startSharing,
        cameraAsContentDeviceId,
        startSharingCameraAsContent,
        stopSharing,
        sharedDevices,
        hasVideoStream,
        camCapReached,
        isCamLocked,
        webcamDeviceId,
        ...props,
      }}
    />
  );
};

export default VideoPreviewContainer;
