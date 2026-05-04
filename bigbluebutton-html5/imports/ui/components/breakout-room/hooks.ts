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
      const err = error as Error;
      const errorMessage = err.message || 'Error stopping media';
      const errorStack = err.stack || 'No stack trace available';

      logger.error({
        logCode: 'breakoutroom_stop_media_error',
        extraInfo: { errorMessage, errorStack },
      }, 'Failed to stop media while joining breakout room');
    }
  }, [exitVideo, streams]);

  return stop;
};

export const useDragAndDrop = (
  moveUser: (userId: string, from: number, to: number) => void,
  setSelectedId: (id: string) => void,
  afterDrop?: () => void,
) => {
  const dragStart = useCallback((ev: React.DragEvent<HTMLElement>) => {
    const el = ev.target as HTMLElement;
    ev.dataTransfer.setData('text', el.id);
    setSelectedId(el.id);
    const ghost = document.createElement('div');
    ghost.textContent = el.textContent || '';
    ghost.style.cssText = 'position:absolute;top:-9999px;padding:4px 8px;background:#fff;border:1px solid #ccc;border-radius:4px;font-size:0.85rem;white-space:nowrap;color:#000;';
    document.body.appendChild(ghost);
    ev.dataTransfer.setDragImage(ghost, 0, 0);
    requestAnimationFrame(() => ghost.remove());
  }, [setSelectedId]);

  const dragEnd = useCallback(() => {
    setSelectedId('');
  }, [setSelectedId]);

  const allowDrop = useCallback((ev: React.DragEvent) => {
    ev.preventDefault();
  }, []);

  const drop = useCallback((roomNumber: number) => (ev: React.DragEvent) => {
    ev.preventDefault();
    const data = ev.dataTransfer.getData('text');
    const separatorIndex = data.lastIndexOf('-');
    if (separatorIndex <= 0) {
      setSelectedId('');
      return;
    }
    const userId = data.substring(0, separatorIndex);
    const from = data.substring(separatorIndex + 1);
    if (!userId || Number.isNaN(Number(from))) {
      setSelectedId('');
      return;
    }
    moveUser(userId, Number(from), roomNumber);
    setSelectedId('');
    if (afterDrop) afterDrop();
  }, [moveUser, setSelectedId, afterDrop]);

  return {
    dragStart, dragEnd, allowDrop, drop,
  };
};

export default {
  useStopMediaOnMainRoom,
  useDragAndDrop,
};
