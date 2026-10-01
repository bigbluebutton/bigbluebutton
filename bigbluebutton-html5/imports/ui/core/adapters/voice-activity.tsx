import { useEffect, useRef } from 'react';
import { useReactiveVar } from '@apollo/client';
import useVoiceActivity from '/imports/ui/core/hooks/useVoiceActivity';
import useHideUserList from '/imports/ui/core/hooks/useHideUserList';
import useShouldUseLiveKitAudioState from '/imports/ui/core/hooks/livekit/useShouldUseLiveKitAudioState';
import {
  setWhoIsUnmutedLoading,
  useWhoIsUnmutedConsumersCount,
  dispatchWhoIsUnmutedUpdate,
} from '/imports/ui/core/hooks/useWhoIsUnmuted';
import {
  setWhoIsTalkingLoading,
  useWhoIsTalkingConsumersCount,
  dispatchWhoIsTalkingUpdate,
} from '/imports/ui/core/hooks/useWhoIsTalking';
import {
  dispatchTalkingUserUpdate,
  setTalkingUserLoading,
  useTalkingUserConsumersCount,
} from '/imports/ui/core/hooks/useTalkingUsers';
import ConnectionStatus from '/imports/ui/core/graphql/singletons/connectionStatus';

const VoiceActivityAdapter = () => {
  const shouldUseLiveKitAudioState = useShouldUseLiveKitAudioState();
  const whoIsUnmutedConsumersCount = useWhoIsUnmutedConsumersCount();
  const whoIsTalkingConsumersCount = useWhoIsTalkingConsumersCount();
  const talkingUserConsumersCount = useTalkingUserConsumersCount();
  const skip = !(
    whoIsUnmutedConsumersCount
    + whoIsTalkingConsumersCount
    + talkingUserConsumersCount > 0
  );
  const { data: voiceActivity, loading: voiceActivityLoading } = useVoiceActivity(skip);
  const connected = useReactiveVar(ConnectionStatus.getConnectedStatusVar());
  const hideUserList = useHideUserList();
  const previousHideUserList = useRef(hideUserList);

  useEffect(() => {
    dispatchWhoIsUnmutedUpdate(voiceActivity);
    dispatchWhoIsTalkingUpdate(voiceActivity);
    dispatchTalkingUserUpdate(voiceActivity);
  }, [voiceActivity]);

  useEffect(() => {
    setWhoIsUnmutedLoading(voiceActivityLoading);
    setWhoIsTalkingLoading(voiceActivityLoading);
    setTalkingUserLoading(voiceActivityLoading);
  }, [voiceActivityLoading]);

  useEffect(() => {
    // Whenever "Hide user list" starts or stops applying to us, the set of users the server
    // will report changes, and it signals that by going quiet rather than by retracting what
    // it already sent. Nothing downstream can retire those rows - the stream is a delta
    // source, so an entry no later pass carries keeps its last state indefinitely - so the
    // client state has to be dropped here on both transitions. Talking state is re-sent on
    // the speaker's next talking event, which makes dropping it cheap.
    //
    // Both talking stores are cleared: dispatchWhoIsTalkingUpdate carries the per-user
    // booleans, dispatchTalkingUserUpdate the records the talking indicator renders. The
    // latter is a no-op on the LiveKit metadata map by design (it merges, never evicts);
    // that map is filtered at render time in useTalkingUsersLiveKit instead.
    //
    // Deliberately NOT clearing the unmuted state: with useLiveKitAudioState off (the default)
    // it is the source for the audio UI, and it is only re-sent on a mute/unmute transition, so
    // clearing it would leave everyone showing as muted until they next toggle.
    //
    // Only an actual transition clears. This effect is ordered after the one that dispatches
    // voiceActivity, so firing on mount would discard a batch that had already been applied.
    if (previousHideUserList.current === hideUserList) return;

    previousHideUserList.current = hideUserList;
    dispatchWhoIsTalkingUpdate(undefined);
    dispatchTalkingUserUpdate(undefined);
  }, [hideUserList]);

  useEffect(() => {
    // Only clear updates on disconnection when using BBB/GraphQL audio state.
    // LiveKit state should be resilient to GraphQL disconnections on certain
    // occasions. Complete absence of data from either sources is treated in
    // the LK hooks.
    if (!connected && !shouldUseLiveKitAudioState) {
      dispatchWhoIsUnmutedUpdate(undefined);
      dispatchWhoIsTalkingUpdate(undefined);
      dispatchTalkingUserUpdate(undefined);
    }
  }, [connected, shouldUseLiveKitAudioState]);

  return null;
};

export default VoiceActivityAdapter;
