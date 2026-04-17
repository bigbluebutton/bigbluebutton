import { useMemo } from 'react';
import useShouldUseLiveKitAudioState from './livekit/useShouldUseLiveKitAudioState';
import useWhoIsUnmutedLiveKit, {
  useWhoIsUnmutedConsumersCount as useWhoIsUnmutedConsumersCountLiveKit,
  setWhoIsUnmutedLoading as setWhoIsUnmutedLoadingLiveKit,
} from './livekit/useWhoIsUnmutedLiveKit';
import useWhoIsUnmutedGraphql, {
  useWhoIsUnmutedConsumersCount as useWhoIsUnmutedConsumersCountGraphql,
  setWhoIsUnmutedLoading as setWhoIsUnmutedLoadingGraphql,
  dispatchWhoIsUnmutedUpdate as dispatchWhoIsUnmutedUpdateGraphql,
} from './useWhoIsUnmutedGraphql';
import { UnmutedUsersState } from './types';

/**
 * Router hook that conditionally uses either BBB's GraphQL or LiveKit's
 * client-side state to provide the unmuted users state.
 *
 * When `useLiveKitAudioState` is enabled AND `audioBridge === 'livekit'`,
 * this hook uses LiveKit's track publication state, else BBB's.
 */
const useWhoIsUnmuted = (): UnmutedUsersState => {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const bbbMuteState = useWhoIsUnmutedGraphql();
  const liveKitMuteState = useWhoIsUnmutedLiveKit();

  return useMemo(() => {
    if (shouldUseLiveKit) return liveKitMuteState;

    return bbbMuteState;
  }, [shouldUseLiveKit, bbbMuteState, liveKitMuteState]);
};

const useWhoIsUnmutedConsumersCount = () => {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const bbbCount = useWhoIsUnmutedConsumersCountGraphql();
  const livekitCount = useWhoIsUnmutedConsumersCountLiveKit();

  return useMemo(() => {
    if (shouldUseLiveKit) return livekitCount;

    return bbbCount;
  }, [shouldUseLiveKit, bbbCount, livekitCount]);
};

const setWhoIsUnmutedLoading = (loading: boolean) => {
  setWhoIsUnmutedLoadingGraphql(loading);
  setWhoIsUnmutedLoadingLiveKit(loading);
};

// Re-export GraphQL dispatch function for backward compatibility
// Only used by adapters when BBB mode is active
export const dispatchWhoIsUnmutedUpdate = dispatchWhoIsUnmutedUpdateGraphql;

export {
  useWhoIsUnmuted,
  useWhoIsUnmutedConsumersCount,
  setWhoIsUnmutedLoading,
};

export default useWhoIsUnmuted;
