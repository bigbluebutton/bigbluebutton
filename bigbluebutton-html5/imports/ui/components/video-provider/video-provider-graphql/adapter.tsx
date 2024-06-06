import { useEffect, useRef } from 'react';
import { useSubscription } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import {
  VIDEO_STREAMS_SUBSCRIPTION,
  VideoStreamsResponse,
} from './queries';
import { setStreams } from './state';
import { AdapterProps } from '../../components-data/graphqlToMiniMongoAdapterManager/component';

const VideoStreamAdapter: React.FC<AdapterProps> = ({
  onReady,
  children,
}) => {
  const ready = useRef(false);
  const { data, loading, error } = useSubscription<VideoStreamsResponse>(VIDEO_STREAMS_SUBSCRIPTION);

  useEffect(() => {
    if (loading) return;

    if (error) {
      logger.error(`Video streams subscription failed. ${error.name}: ${error.message}`, error);
      return;
    }

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
      isModerator: user.isModerator,
      type: 'stream' as const,
    }));

    setStreams(streams);
  }, [data]);

  useEffect(() => {
    if (!ready.current && !loading) {
      ready.current = true;
      onReady('VideoStreamAdapter');
    }
  }, [loading]);

  return children;
};

export default VideoStreamAdapter;
