import { useMemo } from 'react';
import useShouldUseLiveKitAudioState from './livekit/useShouldUseLiveKitAudioState';
import useTalkingUsersLiveKit, {
  useTalkingUserConsumersCount as useTalkingUserConsumersCountLiveKit,
  setTalkingUserLoading as setTalkingUserLoadingLiveKit,
  dispatchTalkingUserUpdate as dispatchTalkingUserUpdateLiveKit,
} from './livekit/useTalkingUsersLiveKit';
import useTalkingUsersGraphql, {
  useTalkingUserConsumersCount as useTalkingUserConsumersCountGraphql,
  dispatchTalkingUserUpdate as dispatchTalkingUserUpdateGraphql,
  setTalkingUserLoading as setTalkingUserLoadingGraphql,
} from './useTalkingUsersGraphql';
import { TalkingUsersHookResult } from './types';
import { VoiceActivityResponse } from '../graphql/queries/voiceActivity';

/**
 * Router hook that conditionally uses either BBB's GraphQL or LiveKit's
 * client-side state to provide the talking users state.
 *
 * When `useLiveKitAudioState` is enabled AND `audioBridge === 'livekit'`,
 * this hook uses LiveKit's participant speaking state combined with user metadata, else BBB's.
 */
const useTalkingUsers = (): TalkingUsersHookResult => {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const bbbTalkingUsersState = useTalkingUsersGraphql();
  const liveKitTalkingUsersState = useTalkingUsersLiveKit();

  return useMemo(() => {
    if (shouldUseLiveKit) return liveKitTalkingUsersState;

    return bbbTalkingUsersState;
  }, [shouldUseLiveKit, bbbTalkingUsersState, liveKitTalkingUsersState]);
};

const useTalkingUserConsumersCount = () => {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const bbbCount = useTalkingUserConsumersCountGraphql();
  const livekitCount = useTalkingUserConsumersCountLiveKit();

  return useMemo(() => {
    if (shouldUseLiveKit) return livekitCount;

    return bbbCount;
  }, [shouldUseLiveKit, bbbCount, livekitCount]);
};

const setTalkingUserLoading = (loading: boolean) => {
  setTalkingUserLoadingGraphql(loading);
  setTalkingUserLoadingLiveKit(loading);
};

const dispatchTalkingUserUpdate = (data?: VoiceActivityResponse['user_voice_activity_stream']) => {
  dispatchTalkingUserUpdateLiveKit(data);
  dispatchTalkingUserUpdateGraphql(data);
};

export {
  useTalkingUserConsumersCount,
  setTalkingUserLoading,
  dispatchTalkingUserUpdate,
};

export default useTalkingUsers;
