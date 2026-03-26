import React from 'react';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useDeduplicatedSubscription from '/imports/ui/core/hooks/useDeduplicatedSubscription';
import { useMeeting } from '/imports/ui/core/hooks/useMeeting';
import { Separator } from '/imports/ui/components/sidebar-content/styles';
import WaitingUserSection from './waiting-users/component';
import { GET_GUEST_WAITING_USERS_SUBSCRIPTION, GuestWaitingUsers } from './waiting-users/queries';

const ASK_MODERATOR = 'ASK_MODERATOR';

interface GuestManagementProps { }

const GuestManagement: React.FC<GuestManagementProps> = () => {
  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));

  const { data: guestWaitingUsersData } = useDeduplicatedSubscription<GuestWaitingUsers>(
    GET_GUEST_WAITING_USERS_SUBSCRIPTION,
  );

  const { data: currentMeeting } = useMeeting((meeting) => ({
    usersPolicies: meeting.usersPolicies,
  }));

  const amIModerator = currentUserData?.isModerator;
  const guestPolicy = currentMeeting?.usersPolicies?.guestPolicy;
  const hasWaitingUsers = !!(guestWaitingUsersData?.user_guest?.length);
  const guestLobbyEnabled = (guestPolicy === ASK_MODERATOR)
    || hasWaitingUsers;

  if (!amIModerator || !guestLobbyEnabled) return null;

  return (
    <>
      <WaitingUserSection />
      {hasWaitingUsers && <Separator />}
    </>
  );
};

export default GuestManagement;
