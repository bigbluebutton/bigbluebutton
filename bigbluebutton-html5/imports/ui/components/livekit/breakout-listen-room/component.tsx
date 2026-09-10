import React, { useCallback, useEffect, useRef } from 'react';
import { useMutation } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import useMeeting from '/imports/ui/core/hooks/useMeeting';
import useIsAudioConnected from '/imports/ui/components/audio/audio-graphql/hooks/useIsAudioConnected';
import { breakoutListenKey } from '/imports/ui/services/livekit';
import { USER_TRANSFER_VOICE_TO_MEETING } from '/imports/ui/components/breakout-room/mutations';
import SecondaryLiveKitRoom from '/imports/ui/components/livekit/secondary-room/component';
import BreakoutTransferNotificationContainer from '/imports/ui/components/livekit/breakout-transfer-notification/container';
import type { LiveKitRoomRow } from '/imports/ui/components/livekit/memberships-manager/hooks';

interface BreakoutListenRoomProps {
  membership: LiveKitRoomRow;
}

// Wrapper for purpose='breakout-listen' memberships: a SecondaryLiveKitRoom
// with
// - Mic attachment
// - Persistent listen-in toast in the client
// - Auto-return handling (e.g.: on BR terminations)
const BreakoutListenRoom: React.FC<BreakoutListenRoomProps> = ({ membership }) => {
  const { data: meeting } = useMeeting((m) => ({ meetingId: m.meetingId }));
  const [transferVoiceToMeeting] = useMutation(USER_TRANSFER_VOICE_TO_MEETING);
  // Raw audio presence state: a USER deafen toggle must not read as an audio
  // exit here as it would a return-to-main-room. Listen-in itself never
  // touches the user's deafened flag - not a possibility right now.
  const inAudio = useIsAudioConnected({ ignoreDeafened: true });
  const wasInAudioRef = useRef(false);

  const breakoutId = membership.roomName;
  const parentMeetingId = meeting?.meetingId ?? '';

  // Return the audio session to the parent meeting, clearing the breakout-listen
  // membership. Used by reconnect exhaustion and exit audio triggers.
  const returnToMain = useCallback((reason: string) => {
    if (!parentMeetingId) return;

    logger.warn({
      logCode: 'breakout_listen_return_to_main',
      extraInfo: { breakoutId, parentMeetingId, reason },
    }, `Breakout-listen returning to main room: ${reason}`);

    transferVoiceToMeeting({
      variables: {
        fromMeetingId: breakoutId,
        toMeetingId: parentMeetingId,
      },
    }).catch((error) => {
      logger.error({
        logCode: 'breakout_listen_return_to_main_failed',
        extraInfo: {
          breakoutId,
          reason,
          errorMessage: (error as Error)?.message,
          errorStack: (error as Error)?.stack,
        },
      }, `Breakout-listen return-to-main failed (${reason}): ${(error as Error)?.message}`);
    });
  }, [breakoutId, parentMeetingId, transferVoiceToMeeting]);

  const handleReconnectExhausted = useCallback(
    () => returnToMain('reconnect_exhausted'),
    [returnToMain],
  );

  const handleTerminalDisconnect = useCallback(
    () => returnToMain('terminal_disconnect'),
    [returnToMain],
  );

  // Leaving audio must end the listen too, or the server-side membership
  // strands the user 'in' the breakout with no audio session.
  useEffect(() => {
    if (inAudio) {
      wasInAudioRef.current = true;
    } else if (wasInAudioRef.current) {
      // Fire the exit audio return-to-main-room only on an actual audio presence
      // transition, and only after the user was actually in audio during the listen in;
      // hence the ref.
      wasInAudioRef.current = false;
      returnToMain('exit_audio');
    }
  }, [inAudio, returnToMain]);

  return (
    <>
      <SecondaryLiveKitRoom
        membership={membership}
        membershipKey={breakoutListenKey(membership.roomName)}
        attachToAudioBridge
        onReconnectExhausted={handleReconnectExhausted}
        onTerminalDisconnect={handleTerminalDisconnect}
      />
      <BreakoutTransferNotificationContainer membership={membership} />
    </>
  );
};

export default BreakoutListenRoom;
