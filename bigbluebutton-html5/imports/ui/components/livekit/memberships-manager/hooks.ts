import { useMemo } from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import type { LiveKitRoomMembership } from '/imports/ui/Types/user';

export type LiveKitRoomRow = LiveKitRoomMembership;

const EMPTY: LiveKitRoomRow[] = [];

// Memberships piggyback on the current-user subscription (livekitRooms)
// instead of a dedicated subscription: one live query per client.
export const useUserLiveKitMemberships = (): LiveKitRoomRow[] => {
  const { data } = useCurrentUser((u) => ({ userId: u.userId, livekitRooms: u.livekitRooms }));
  const rooms = data?.livekitRooms;

  return useMemo(() => {
    if (!rooms) return EMPTY;

    const active = rooms.filter((r) => typeof r.token === 'string' && r.token.length > 0);

    return active.length > 0 ? active : EMPTY;
  }, [rooms]);
};

export const useHasActiveNonPrimaryMembership = (): boolean => {
  const memberships = useUserLiveKitMemberships();

  return useMemo(
    () => memberships.some((m) => m.purpose !== 'primary'),
    [memberships],
  );
};

export default useUserLiveKitMemberships;
