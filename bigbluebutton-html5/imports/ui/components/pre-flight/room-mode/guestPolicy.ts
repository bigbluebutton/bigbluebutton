import { useEffect } from 'react';
import { gql } from '@apollo/client';
import logger from '/imports/startup/client/logger';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';

// Readable before the join: the middleware lets this operation through for users
// who are not in the meeting yet (AllowedSubscriptionsForNotInMeetingUsers).
export const ROOM_MODE_GUEST_POLICY_SUBSCRIPTION = gql`
  subscription getRoomModeGuestPolicy {
    meeting_usersPolicies {
      guestPolicy
    }
  }
`;

interface RoomModeGuestPolicyResponse {
  meeting_usersPolicies: { guestPolicy: string }[];
}

/**
 * The room's guest policy, for the room mode panel only: it runs unless
 * skipped, and the caller skips it whenever the panel is not shown. The policy
 * can change while the panel is open, so it is subscribed to rather than read
 * once. Undefined until it arrives, and if it cannot be read: the summary then
 * leaves the setting out.
 */
const useRoomModeGuestPolicy = (skip: boolean): string | undefined => {
  const { data, error } = useDeduplicatedSubscription<RoomModeGuestPolicyResponse>(
    ROOM_MODE_GUEST_POLICY_SUBSCRIPTION,
    { skip },
  );

  useEffect(() => {
    if (!error) return;
    logger.warn({
      logCode: 'room_mode_guest_policy_read_failed',
      extraInfo: { error: error.message },
    }, 'Room guest policy not read: the room mode summary leaves it out');
  }, [error]);

  return skip || error ? undefined : data?.meeting_usersPolicies?.[0]?.guestPolicy;
};

export default useRoomModeGuestPolicy;
