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

/**
 * Return type for the useWhoIsTalking hook (full state).
 */
export type TalkingUsersState = {
  data: Record<string, boolean>;
  loading: boolean;
};

/**
 * Return type for the useWhoIsTalking hook (per-user).
 */
export type TalkingUserState = {
  data: boolean | undefined;
  loading: boolean;
};

/**
 * Router hook that conditionally uses either BBB's GraphQL or LiveKit's
 * client-side state to provide the talking users state.
 *
 * When `useLiveKitAudioState` is enabled AND `audioBridge === 'livekit'`,
 * this hook uses LiveKit's participant speaking state, else BBB's.
 *
 * Supports two signatures:
 * - useWhoIsTalking() - Returns all talking users
 * - useWhoIsTalking(userId) - Returns a single user's talking state
 */
function useWhoIsTalking(): TalkingUsersState;
function useWhoIsTalking(userId: string): TalkingUserState;
function useWhoIsTalking(userId?: string): TalkingUsersState | TalkingUserState {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const bbbTalkingState = userId !== undefined
    ? useWhoIsTalkingGraphql(userId)
    : useWhoIsTalkingGraphql();
  const liveKitTalkingState = userId !== undefined
    ? useWhoIsTalkingLiveKit(userId)
    : useWhoIsTalkingLiveKit();

  return useMemo(() => {
    if (shouldUseLiveKit) return liveKitTalkingState;

    return bbbTalkingState;
  }, [shouldUseLiveKit, bbbTalkingState, liveKitTalkingState]);
}

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
