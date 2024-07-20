import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useMeeting from '/imports/ui/core/hooks/useMeeting';

const useHasPermission = () => {
  const { data: currentUserData } = useCurrentUser((u) => ({
    locked: u.locked,
    role: u.role,
  }));
  const { data: meetingData } = useMeeting((m) => ({
    lockSettings: m.lockSettings,
  }));

  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

  if (currentUserData?.role === ROLE_MODERATOR) return true;

  if (currentUserData?.locked) {
    return !meetingData?.lockSettings?.disableNotes;
  }

  return true;
};

export default useHasPermission;
