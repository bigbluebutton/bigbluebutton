import { useEffect, useState } from 'react';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import logger from '/imports/startup/client/logger';
import { isRoomModePanelEnabled } from '../service';
import { GET_ROOM_MODE, GetRoomModeResponse } from './queries';

// The middleware drops an operation it refuses before the join without
// answering, so a read that never lands is a failure too, not a wait.
const ROOM_MODE_READ_TIMEOUT = 10000;

interface RoomModePanelGate {
  // The room mode is still on its way: the screen must not offer the join yet,
  // or it would flash the participant layout before the panel.
  loading: boolean;
  show: boolean;
}

/**
 * The panel is for a moderator entering a room nobody has configured: an empty
 * room mode. A failed or unanswered read leaves the screen as it is for
 * everyone else, and the room opens as it was created.
 */
const useRoomModePanelGate = (
  isModerator: boolean,
  isBot: boolean,
  active: boolean,
): RoomModePanelGate => {
  const enabled = active && isModerator && !isBot && isRoomModePanelEnabled();
  const { data, loading, error } = useDeduplicatedSubscription<GetRoomModeResponse>(
    GET_ROOM_MODE,
    { skip: !enabled },
  );
  const roomMode = data?.meeting?.[0]?.roomMode;
  const pending = enabled && !error && (loading || roomMode === undefined);
  const [timedOut, setTimedOut] = useState(false);

  useEffect(() => {
    if (!pending) return undefined;
    const timeout = setTimeout(() => {
      logger.warn({
        logCode: 'pre_flight_room_mode_read_timeout',
        extraInfo: { timeout: ROOM_MODE_READ_TIMEOUT },
      }, 'Room mode read got no answer, falling back to the regular join');
      setTimedOut(true);
    }, ROOM_MODE_READ_TIMEOUT);
    return () => clearTimeout(timeout);
  }, [pending]);

  // Once it has fallen back, the screen stays on the regular join: a late
  // answer must not swap the join step for the panel under the user.
  if (!enabled || error || timedOut) return { loading: false, show: false };
  if (pending) return { loading: true, show: false };

  return { loading: false, show: roomMode === '' };
};

export default useRoomModePanelGate;
