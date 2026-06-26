import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { MEDIA_GROUP_STREAMS_SUBSCRIPTION } from '/imports/ui/components/livekit/selective-subscription/queries';
import { MediaGroupParticipant } from '/imports/ui/components/livekit/selective-subscription/types';

interface MediaGroupStreamsResponse {
  user_mediaGroup: MediaGroupParticipant[];
}

/**
 * Shared, deduplicated subscription to the user_mediaGroup state. Consumers
 * receive the raw participant rows and filter/process them by media type.
 */
const useUserMediaGroupStateStream = () => {
  const { data, error } = useDeduplicatedSubscription<MediaGroupStreamsResponse>(
    MEDIA_GROUP_STREAMS_SUBSCRIPTION,
  );

  return { data: data?.user_mediaGroup, error };
};

export default useUserMediaGroupStateStream;
