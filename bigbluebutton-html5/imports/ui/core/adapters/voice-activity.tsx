import { useEffect } from 'react';
import { useReactiveVar } from '@apollo/client';
import useVoiceActivity from '/imports/ui/core/hooks/useVoiceActivity';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
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
import Auth from '/imports/ui/services/auth';

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
  const { data: currentUserData } = useCurrentUser((user) => ({ locked: user.locked }));
  const { data: currentMeeting } = useMeeting((m) => ({ lockSettings: m.lockSettings }));
  // v_user.locked is already false for moderators.
  const hideUserList = Boolean(
    currentUserData?.locked && currentMeeting?.lockSettings?.hideUserList,
  );

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
    // When "Hide user list" starts applying to us the server stops sending voice activity for
    // hidden participants, which would otherwise leave their last known talking state frozen on
    // e.g. their video tile. Talking state is re-sent on the speaker's next talking event, so
    // dropping it is cheap.
    //
    // Deliberately NOT clearing the unmuted state: with useLiveKitAudioState off (the default) it
    // is the source for the audio UI, and it is only re-sent on a mute/unmute transition, so
    // clearing it would leave everyone showing as muted until they next toggle.
    //
    // The LiveKit metadata map is not cleared either - dispatchTalkingUserUpdate(undefined) is a
    // no-op there by design (it merges, never evicts). It does not need clearing: the hideUserList
    // guard in useTalkingUsersLiveKit filters that map by role on every pass, so entries captured
    // before the lock was applied are dropped at render time.
    if (hideUserList) {
      dispatchWhoIsTalkingUpdate(undefined);
    }
  }, [hideUserList]);

  useEffect(() => {
    // Only clear updates on disconnection when using BBB/GraphQL audio state.
    // LiveKit state should be resilient to GraphQL disconnections on certain
    // occasions. Complete absence of data from either sources is treated in
    // the LK hooks.
    if (connected || shouldUseLiveKitAudioState) return;

    // Everyone but the local user is dropped and rebuilt from the unmuted set
    // on disconnections. The local entry stays because an absent one reads as
    // muted, and that causes a local state inconsistency where the microphone
    // might actually be unmuted/transmitting, but the UI shows it as muted.
    dispatchWhoIsUnmutedUpdate(undefined, [Auth.userID as string]);
    dispatchWhoIsTalkingUpdate(undefined);
    dispatchTalkingUserUpdate(undefined);
  }, [connected, shouldUseLiveKitAudioState]);

  return null;
};

export default VoiceActivityAdapter;
