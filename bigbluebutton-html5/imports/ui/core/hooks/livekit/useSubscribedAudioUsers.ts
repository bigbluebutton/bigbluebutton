import { useMemo, useRef } from 'react';
import { isEqual } from 'radash';
import { useTracks } from '@livekit/components-react';
import { RoomEvent, Track } from 'livekit-client';
import { liveKitRoom } from '/imports/ui/services/livekit';
import useShouldUseLiveKitAudioState from './useShouldUseLiveKitAudioState';

const BASELINE_DATA: Record<string, boolean> = Object.freeze({});

/**
 * Hook that returns a Map of userId -> boolean for participants whose
 * audio tracks the client is subscribed to in LiveKit.
 * Absence of a userId in the map means not subscribed.
 *
 */
const useSubscribedAudioUsers = (): Record<string, boolean> => {
  const shouldUseLiveKit = useShouldUseLiveKitAudioState();
  const subscribedUsersRef = useRef<Record<string, boolean>>({});
  const microphoneTracks = useTracks([Track.Source.Microphone], {
    room: liveKitRoom,
    onlySubscribed: true,
    updateOnlyOn: [
      RoomEvent.TrackSubscribed,
      RoomEvent.TrackUnsubscribed,
      RoomEvent.TrackPublished,
      RoomEvent.TrackUnpublished,
    ],
  });

  return useMemo(() => {
    if (!shouldUseLiveKit) return BASELINE_DATA;

    const subscribedUsers: Record<string, boolean> = {};
    microphoneTracks.forEach((trackRef) => {
      const userId = trackRef.participant.identity;
      subscribedUsers[userId] = true;
    });

    if (isEqual(subscribedUsers, subscribedUsersRef.current)) {
      return subscribedUsersRef.current;
    }

    subscribedUsersRef.current = subscribedUsers;

    return subscribedUsers;
  }, [shouldUseLiveKit, microphoneTracks]);
};

export default useSubscribedAudioUsers;
