import { useMemo } from 'react';
import { isRoomModePanelEnabled } from '../service';
import { RoomModeRoomValues } from './settings';

interface RoomModePanelGate {
  show: boolean;
  // The room's current values for what a mode leaves as created.
  roomValues: RoomModeRoomValues;
}

/**
 * The panel is for a moderator entering a room nobody has configured: an empty
 * room mode. The mode comes from user_current.meeting, in the same payload as
 * the moderator flag, and the screen waits for that payload, so the mode is
 * there whenever the gate runs. Should it ever be missing (no meeting row),
 * the regular join step is the fallback rather than a wait with no way out.
 * The room's guest policy comes along the same read; its recording policy,
 * fixed at creation, comes from the meeting's static data.
 */
const useRoomModePanelGate = (
  roomMode: string | undefined,
  guestPolicy: string | undefined,
  record: boolean,
  autoStartRecording: boolean,
  isModerator: boolean,
  isBot: boolean,
  active: boolean,
): RoomModePanelGate => {
  const enabled = active && isModerator && !isBot && isRoomModePanelEnabled();
  const roomValues = useMemo<RoomModeRoomValues>(() => {
    const values: RoomModeRoomValues = { record, autoStartRecording };
    if (guestPolicy) values.guestPolicy = guestPolicy;
    return values;
  }, [guestPolicy, record, autoStartRecording]);

  return { show: enabled && roomMode === '', roomValues };
};

export default useRoomModePanelGate;
