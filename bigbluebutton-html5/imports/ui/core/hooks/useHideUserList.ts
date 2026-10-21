import { useMemo } from 'react';
import useCurrentUser from './useCurrentUser';
import useMeeting from './useMeeting';

/**
 * Whether the "Hide user list" lock currently applies to us.
 *
 * Single source for a derivation that was open-coded in several places. Composes
 * useCurrentUser and useMeeting, both of which every call site already subscribes to, so
 * this adds no subscription of its own.
 *
 * The two terms are treated asymmetrically on purpose:
 *
 * - The meeting term must be known true. While lockSettings is unresolved this returns
 *   false, so the lock is inert in meetings that do not have it set - otherwise every
 *   meeting would suppress its talking indicators for the duration of the load window.
 * - The user term resolves to locked while unknown. Inside a meeting that does have the
 *   lock set, an unresolved current user means "we do not yet know that we are exempt",
 *   and the exempt case is the one that can wait.
 *
 * v_user.locked is already false for moderators, so `locked` alone carries the role check.
 */
const useHideUserList = (): boolean => {
  const { data: currentUser } = useCurrentUser((user) => ({ locked: user.locked }));
  const { data: currentMeeting } = useMeeting((m) => ({ lockSettings: m.lockSettings }));

  const meetingHidesUserList = currentMeeting?.lockSettings?.hideUserList === true;
  const weAreExempt = currentUser?.locked === false;

  return useMemo(
    () => meetingHidesUserList && !weAreExempt,
    [meetingHidesUserList, weAreExempt],
  );
};

export default useHideUserList;
