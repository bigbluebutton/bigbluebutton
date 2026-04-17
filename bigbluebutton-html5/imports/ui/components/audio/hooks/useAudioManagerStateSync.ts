import { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import useWhoIsUnmuted from '/imports/ui/core/hooks/useWhoIsUnmuted';
import useWhoIsTalking from '/imports/ui/core/hooks/useWhoIsTalking';
import useShouldUseLiveKitAudioState from '/imports/ui/core/hooks/livekit/useShouldUseLiveKitAudioState';
import AudioManager from '/imports/ui/services/audio-manager';
import Auth from '/imports/ui/services/auth';

/**
 * Hook that synchronizes AudioManager's isMuted and isTalking states
 * based on state provided by the useWhoIsUnmuted and useWhoIsTalking hooks.
 *
 * This is a no-op when public.media.livekit.audio.useLiveKitAudioState is false.
 */
const useAudioManagerStateSync = () => {
  const { data: unmutedUsers, loading: unmutedLoading } = useWhoIsUnmuted();
  const { data: talkingUsers, loading: talkingLoading } = useWhoIsTalking();
  const shouldUseLiveKitAudioState = useShouldUseLiveKitAudioState();
  const currentUserId = Auth.userID as string;
  /* eslint no-underscore-dangle: 0 */
  // @ts-ignore - AudioManager is untyped
  const currentMuteState = useReactiveVar(AudioManager._isMuted.value) as boolean;
  // @ts-ignore - AudioManager is untyped
  const currentTalkingState = useReactiveVar(AudioManager._isTalking.value) as boolean;

  // Synchronize mute state
  useEffect(() => {
    if (!shouldUseLiveKitAudioState || unmutedLoading || !currentUserId) return;

    const newMuteState = !unmutedUsers[currentUserId];

    if (currentMuteState !== newMuteState) {
      AudioManager.isMuted = newMuteState;

      if (newMuteState) {
        AudioManager.mute();
      } else {
        AudioManager.unmute();
      }
    }
  }, [
    currentUserId,
    unmutedUsers,
    unmutedLoading,
    currentMuteState,
    shouldUseLiveKitAudioState,
  ]);

  // Synchronize talking state
  useEffect(() => {
    if (!shouldUseLiveKitAudioState || talkingLoading || !currentUserId) return;

    const isTalking = talkingUsers[currentUserId];
    // Respect mute state: if muted, talking should be false
    const newTalkingState = isTalking && !currentMuteState;

    // Only update if the desired talking state differs from the current one.
    if (currentTalkingState !== newTalkingState) {
      AudioManager.isTalking = newTalkingState;
    }
  }, [
    currentUserId,
    talkingUsers,
    talkingLoading,
    currentMuteState,
    currentTalkingState,
    shouldUseLiveKitAudioState,
  ]);

  // Ensure talking is false when muted
  useEffect(() => {
    if (!shouldUseLiveKitAudioState) return;

    if (currentMuteState && currentTalkingState) {
      AudioManager.isTalking = false;
    }
  }, [currentMuteState, currentTalkingState, shouldUseLiveKitAudioState]);
};

export default useAudioManagerStateSync;
