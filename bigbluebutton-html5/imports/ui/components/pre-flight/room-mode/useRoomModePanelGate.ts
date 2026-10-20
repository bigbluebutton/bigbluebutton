import { isRoomModePanelEnabled } from '../service';

interface RoomModePanelGate {
  // The room mode is still on its way: the screen must not offer the join yet,
  // or it would flash the participant layout before the panel.
  loading: boolean;
  show: boolean;
}

/**
 * The panel is for a moderator entering a room nobody has configured: an empty
 * room mode. The mode comes from user_current.meeting, the read every client
 * already holds before the join, so undefined means it has not arrived yet.
 */
const useRoomModePanelGate = (
  roomMode: string | undefined,
  isModerator: boolean,
  isBot: boolean,
  active: boolean,
): RoomModePanelGate => {
  const enabled = active && isModerator && !isBot && isRoomModePanelEnabled();

  if (!enabled) return { loading: false, show: false };
  if (roomMode === undefined) return { loading: true, show: false };

  return { loading: false, show: roomMode === '' };
};

export default useRoomModePanelGate;
