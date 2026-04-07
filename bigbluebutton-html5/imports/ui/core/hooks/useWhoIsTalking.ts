import { useMemo } from 'react';
import useShouldUseLiveKitAudioState from './livekit/useShouldUseLiveKitAudioState';
import useWhoIsTalkingLiveKit, {
  useWhoIsTalkingConsumersCount as useWhoIsTalkingConsumersCountLiveKit,
  setWhoIsTalkingLoading as setWhoIsTalkingLoadingLiveKit,
} from './livekit/useWhoIsTalkingLiveKit';
import useWhoIsTalkingGraphql, {
  useWhoIsTalkingConsumersCount as useWhoIsTalkingConsumersCountGraphql,
  setWhoIsTalkingLoading as setWhoIsTalkingLoadingGraphql,
  dispatchWhoIsTalkingUpdate as dispatchWhoIsTalkingUpdateGraphql,
} from './useWhoIsTalkingGraphql';
import { TalkingUsersState } from './types';

/**
 * Router hook that conditionally uses either BBB's GraphQL or LiveKit's
 * client-side state to provide the talking users state.
 *
 * When `useLiveKitAudioState` is enabled AND `audioBridge === 'livekit'`,
 * this hook uses LiveKit's participant speaking state, else BBB's.
 */
const useWhoIsTalking = (): TalkingUsersState => {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const bbbTalkingState = useWhoIsTalkingGraphql();
  const liveKitTalkingState = useWhoIsTalkingLiveKit();

  return useMemo(() => {
    if (shouldUseLiveKit) return liveKitTalkingState;

    return bbbTalkingState;
  }, [shouldUseLiveKit, bbbTalkingState, liveKitTalkingState]);
};

const useWhoIsTalkingConsumersCount = () => {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const bbbCount = useWhoIsTalkingConsumersCountGraphql();
  const livekitCount = useWhoIsTalkingConsumersCountLiveKit();

  return useMemo(() => {
    if (shouldUseLiveKit) return livekitCount;

    return bbbCount;
  }, [shouldUseLiveKit, bbbCount, livekitCount]);
};

const setWhoIsTalkingLoading = (loading: boolean) => {
  setWhoIsTalkingLoadingGraphql(loading);
  setWhoIsTalkingLoadingLiveKit(loading);
};

// Re-export GraphQL dispatch function for backward compatibility
// Only used by adapters when BBB mode is active
export const dispatchWhoIsTalkingUpdate = dispatchWhoIsTalkingUpdateGraphql;

export {
  useWhoIsTalking,
  useWhoIsTalkingConsumersCount,
  setWhoIsTalkingLoading,
};

export default useWhoIsTalking;
