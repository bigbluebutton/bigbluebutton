// @ts-nocheck
/* eslint-disable */
import { useEffect } from 'react';
import { useSubscription } from '@apollo/client';
import {
  VIDEO_STREAMS_SUBSCRIPTION,
  VideoStreamsResponse,
} from './queries';
import { setStreams } from './state';

const VideoStreamAdapter: React.FC = () => {
  const { data, loading, error } = useSubscription<VideoStreamsResponse>(VIDEO_STREAMS_SUBSCRIPTION);

  useEffect(() => {
    if (loading || error) return;

    if (!data) {
      setStreams([]);
      return;
    }

    const streams = data.user_camera.map(({ streamId, user, voice }) => ({
      stream: streamId,
      deviceId: streamId.split('_')[2],
      userId: user.userId,
      name: user.name,
      sortName: user.nameSortable,
      pin: user.pinned,
      floor: voice?.floor || false,
      lastFloorTime: voice?.lastFloorTime || '0',
      isUserModerator: user.isModerator,
    }));

    setStreams(streams);
  }, [data]);

  return null;
};

export default VideoStreamAdapter;
