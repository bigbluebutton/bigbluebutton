import { useEffect, useRef } from 'react';
import { throttle } from 'radash';
import logger from '/imports/startup/client/logger';
import { VIDEO_STREAMS_SUBSCRIPTION } from './queries';
import { VideoStreamsResponse } from './types';
import { setStreams } from './state';
import { AdapterProps } from '../components-data/graphqlToMakeVarAdapterManager/component';
import createUseSubscription from '/imports/ui/core/hooks/createUseSubscription';

const throttledSetStreams = throttle({ interval: 500 }, setStreams);

type SubscriptionData = VideoStreamsResponse['user_camera'][number];

const useVideoStreamsSubscription = createUseSubscription(
  VIDEO_STREAMS_SUBSCRIPTION,
  {},
  true,
);

const VideoStreamAdapter: React.FC<AdapterProps> = ({
  onReady,
  children,
}) => {
  const ready = useRef(false);
  const { data, loading, errors } = useVideoStreamsSubscription();

  useEffect(() => {
    if (loading) return;

    if (errors) {
      errors.forEach((error) => {
        logger.error({
          logCode: 'video_stream_sub_error',
          extraInfo: {
            errorName: error.name,
            errorMessage: error.message,
          },
        }, 'Video streams subscription failed.');
      });
    }

    if (!data) {
      throttledSetStreams([]);
      return;
    }

    const streams = (data as SubscriptionData[]).map(({ streamId, user, voice }) => ({
      stream: streamId,
      deviceId: streamId.split('_')[3],
      name: user.name,
      nameSortable: user.nameSortable,
      userId: user.userId,
      user,
      floor: voice?.floor ?? false,
      lastFloorTime: voice?.lastFloorTime ?? '0',
      voice,
      type: 'stream' as const,
    }));

    throttledSetStreams(streams);
  }, [data]);

  useEffect(() => {
    if (!ready.current) {
      ready.current = true;
      onReady('VideoStreamAdapter');
    }
  }, [loading]);

  return children;
};

export default VideoStreamAdapter;
