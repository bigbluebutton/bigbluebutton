import { useEffect } from 'react';
import { gql } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { LockSettingsValues } from '/imports/ui/components/lock-viewers/service';

/**
 * The settings a room mode changes, as the room was created. A mode is always
 * applied over them, so switching modes drops the previous mode and anything
 * changed by hand since. Written by the server when the room is created.
 */
export interface RoomModeBase {
  // The server writes the lock settings proper, not the row's bookkeeping.
  lockSettings: LockSettingsValues;
  usersPolicies: {
    // Kept for modes that leave the webcams as created; today every mode sets them.
    webcamsOnlyForModerator: boolean;
    guestPolicy: string;
    multiUserWhiteboardEnabled: boolean;
  };
  voiceSettings: {
    muteOnStart: boolean;
  };
}

export const ROOM_BASE_SETTINGS_SUBSCRIPTION = gql`
  subscription RoomBaseSettings {
    meeting {
      roomBaseSettings
    }
  }
`;

interface RoomBaseSettingsResponse {
  meeting: { roomBaseSettings: RoomModeBase | null }[];
}

interface RoomModeBaseState {
  loading: boolean;
  // Null for a room created before the server kept it, or when it cannot be
  // read: the mode is then applied over the room's current state.
  base: RoomModeBase | null;
}

// Joined users only: the meeting row is not readable before the join.
const useRoomModeBase = (): RoomModeBaseState => {
  const { data, loading, error } = useDeduplicatedSubscription<RoomBaseSettingsResponse>(
    ROOM_BASE_SETTINGS_SUBSCRIPTION,
  );

  useEffect(() => {
    if (!error) return;
    logger.warn({
      logCode: 'room_mode_base_read_failed',
      extraInfo: { error: error.message },
    }, 'Room base settings not read: room modes apply over the current state');
  }, [error]);

  // A failed read counts as no base, never as one still loading: the applier
  // would otherwise wait for it for good.
  return {
    loading: !error && (loading || !data),
    base: error ? null : data?.meeting?.[0]?.roomBaseSettings ?? null,
  };
};

export default useRoomModeBase;
