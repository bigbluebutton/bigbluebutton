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

/**
 * Return type for the useWhoIsUnmuted hook (full state).
 */
export type UnmutedUsersState = {
  data: Record<string, boolean>;
  loading: boolean;
};

/**
 * Return type for the useWhoIsUnmuted hook (per-user).
 */
export type UnmutedUserState = {
  data: boolean | undefined;
  loading: boolean;
};

/**
 * Router hook that conditionally uses either BBB's GraphQL or LiveKit's
 * client-side state to provide the unmuted users state.
 *
 * When `useLiveKitAudioState` is enabled AND `audioBridge === 'livekit'`,
 * this hook uses LiveKit's track publication state, else BBB's.
 *
 * Supports two signatures:
 * - useWhoIsUnmuted() - Returns all unmuted users
 * - useWhoIsUnmuted(userId) - Returns single user's state
 */
function useWhoIsUnmuted(): UnmutedUsersState;
function useWhoIsUnmuted(userId: string): UnmutedUserState;
function useWhoIsUnmuted(userId?: string): UnmutedUsersState | UnmutedUserState {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const bbbUnmutedState = userId !== undefined
    ? useWhoIsUnmutedGraphql(userId)
    : useWhoIsUnmutedGraphql();
  const liveKitUnmutedState = userId !== undefined
    ? useWhoIsUnmutedLiveKit(userId)
    : useWhoIsUnmutedLiveKit();

  return useMemo(() => {
    if (shouldUseLiveKit) return liveKitUnmutedState;

    return bbbUnmutedState;
  }, [shouldUseLiveKit, bbbUnmutedState, liveKitUnmutedState]);
}

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
