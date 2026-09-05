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
import { VoiceItem } from './useTimedTalkingIndicator';
import { VoiceActivityResponse } from '../graphql/queries/voiceActivity';

export type TalkingUsersHookResult = {
  error: undefined;
  loading: boolean;
  data: Record<string, VoiceItem>;
};

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

    // Opt-in off: BBB voice-activity is authoritative. But it only knows users
    // with a server voice record, so a participant who is audible in a LiveKit
    // room without one (e.g. a moderator transferred into a breakout to listen)
    // never gets an indicator. Overlay those LiveKit-only talkers on top.
    //
    // Restricted to web identities ("w_"): those are keyed identically in
    // LiveKit and in BBB, so they dedup cleanly against the BBB data.
    // Dial-in participants use a different key on each side (their LiveKit
    // identity vs. the "v_<sid>" BBB id) and are always server-tracked, so
    // overlaying them could double them, so still BBB-mandated.
    const bbbData = bbbTalkingUsersState.data;
    const liveKitData = liveKitTalkingUsersState.data;
    const extraUserIds = Object.keys(liveKitData).filter(
      (userId) => userId.startsWith('w_') && !(userId in bbbData),
    );

    if (extraUserIds.length === 0) return bbbTalkingUsersState;

    const mergedData = { ...bbbData };
    extraUserIds.forEach((userId) => {
      mergedData[userId] = liveKitData[userId];
    });

    return { ...bbbTalkingUsersState, data: mergedData };
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
