import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import Service from './service';
import { useMutation } from '@apollo/client';
import VideoPreview from './component';
import VideoService from '../video-provider/service';
import ScreenShareService from '/imports/ui/components/screenshare/service';
import logger from '/imports/startup/client/logger';
import { SCREENSHARING_ERRORS } from '/imports/api/screenshare/client/bridge/errors';
import { EXTERNAL_VIDEO_STOP } from '../external-video-player/mutations';
import { CAMERA_BROADCAST_STOP } from '../video-provider/mutations';

const VideoPreviewContainer = (props) => <VideoPreview {...props} />;

export default withTracker(({ setIsOpen, callbackToClose }) => {
  const [stopExternalVideoShare] = useMutation(EXTERNAL_VIDEO_STOP);
  const [cameraBroadcastStop] = useMutation(CAMERA_BROADCAST_STOP);

  const sendUserUnshareWebcam = (cameraId) => {
    cameraBroadcastStop({ variables: { cameraId } });
  };

  return {
    startSharing: (deviceId) => {
      callbackToClose();
      setIsOpen(false);
      VideoService.joinVideo(deviceId);
    },
    startSharingCameraAsContent: (deviceId) => {
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
        true, handleFailure, { stream: Service.getStream(deviceId)._mediaStream }
      );
      ScreenShareService.setCameraAsContentDeviceId(deviceId);
    },
    stopSharing: (deviceId) => {
      callbackToClose();
      setIsOpen(false);
      if (deviceId) {
        const streamId = VideoService.getMyStreamId(deviceId);
        if (streamId) VideoService.stopVideo(streamId, sendUserUnshareWebcam);
      } else {
        VideoService.exitVideo(sendUserUnshareWebcam);
      }
    },
    stopSharingCameraAsContent: () => {
      callbackToClose();
      setIsOpen(false);
      ScreenShareService.screenshareHasEnded();
    },
    sharedDevices: VideoService.getSharedDevices(),
    cameraAsContentDeviceId: ScreenShareService.getCameraAsContentDeviceId(),
    isCamLocked: VideoService.isUserLocked(),
    camCapReached: VideoService.hasCapReached(),
    closeModal: () => {
      callbackToClose();
      setIsOpen(false);
    },
    webcamDeviceId: Service.webcamDeviceId(),
    hasVideoStream: VideoService.hasVideoStream(),
  };
})(VideoPreviewContainer);
