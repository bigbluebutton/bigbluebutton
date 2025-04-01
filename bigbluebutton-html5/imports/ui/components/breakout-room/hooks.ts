import { useCallback } from 'react';
import logger from '/imports/startup/client/logger';
import { useExitVideo, useStreams } from '/imports/ui/components/video-provider/hooks';
import {
  finishScreenShare,
  forceExitAudio,
  stopVideo,
} from '/imports/ui/components/breakout-room/breakout-room/service';
import VideoService from '/imports/ui/components/video-provider/service';

export const useStopMediaOnMainRoom = () => {
  const exitVideo = useExitVideo(true);
  const streams = useStreams();

  const stop = useCallback((presenter: boolean) => {
    try {
      forceExitAudio();
      VideoService.storeDeviceIds(streams);
      stopVideo(exitVideo, streams);
      logger.info({
        logCode: 'breakoutroom_join_stop_media',
        extraInfo: { logType: 'user_action' },
      }, 'Joining breakout room closed audio in the main room');
      if (presenter) finishScreenShare();
    } catch (error) {
      logger.error({
        logCode: 'breakoutroom_stop_media_error',
        extraInfo: { errorMessage: error.message, errorStack: error.stack },
      }, 'Failed to stop media while joining breakout room');
    }
  }, [exitVideo, streams]);

  return stop;
};

export default {
  useStopMediaOnMainRoom,
};
