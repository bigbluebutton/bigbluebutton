import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { User } from '../../Types/user';
import { precompareResponses } from './useStableResponse';

export const userShallowEqual = (a?: Partial<User>, b?: Partial<User>): boolean => {
  if (a === b) return true;
  if (!a && !b) return true;
  if (!a || !b) return false;

  if ((a.userId ?? '') !== (b.userId ?? '')) return false;
  if ((a.name ?? '') !== (b.name ?? '')) return false;
  if (!!a.presenter !== !!b.presenter) return false;
  if (!!a.pinned !== !!b.pinned) return false;
  if (!!a.isModerator !== !!b.isModerator) return false;
  if ((a.role ?? '') !== (b.role ?? '')) return false;
  if ((a.color ?? '') !== (b.color ?? '')) return false;
  if ((a.avatar ?? '') !== (b.avatar ?? '')) return false;
  if ((a.disconnected ?? false) !== (b.disconnected ?? false)) return false;
  if ((a.currentlyInMeeting ?? false) !== (b.currentlyInMeeting ?? false)) return false;
  if ((a.joined ?? false) !== (b.joined ?? false)) return false;
  if ((a.loggedOut ?? false) !== (b.loggedOut ?? false)) return false;
  if ((a.mobile ?? false) !== (b.mobile ?? false)) return false;
  if ((a.raiseHand ?? false) !== (b.raiseHand ?? false)) return false;
  if ((a.away ?? false) !== (b.away ?? false)) return false;
  if ((a.locked ?? false) !== (b.locked ?? false)) return false;

  // voice (partial)
  const av = a.voice;
  const bv = b.voice;
  if ((av?.joined ?? false) !== (bv?.joined ?? false)) return false;
  if ((av?.muted ?? false) !== (bv?.muted ?? false)) return false;
  if ((av?.talking ?? false) !== (bv?.talking ?? false)) return false;
  if ((av?.callerNum ?? '') !== (bv?.callerNum ?? '')) return false;

  // cameras length is a good proxy for camera state changes
  if (((a.cameras ?? []).length) !== ((b.cameras ?? []).length)) return false;

  // shallow compare small nested objects
  if (
    (a.userLockSettings?.disablePublicChat ?? false)
    !== (b.userLockSettings?.disablePublicChat ?? false)
  ) return false;
  if ((a.sessionCurrent?.enforceLayout ?? false) !== (b.sessionCurrent?.enforceLayout ?? false)) return false;

  return true;
};

export const userListComparator = (
  a: GraphqlDataHookSubscriptionResponse<Partial<User>[]> | null,
  b: GraphqlDataHookSubscriptionResponse<Partial<User>[]>,
) => {
  const pre = precompareResponses<Partial<User>[]>(a, b);
  if (pre === true) return true;
  if (pre === false) return false;

  const { aData, bData } = pre;
  const aa = aData as Partial<User>[] | undefined;
  const bb = bData as Partial<User>[] | undefined;

  // lengths already checked for nulls in precompareResponses
  if (!aa || !bb) return false;
  if (aa.length !== bb.length) return false;

  // Compare by userId set to be order-insensitive but respect identity
  const bMap = new Map<string, Partial<User>>();
  for (let i = 0; i < bb.length; i += 1) {
    const u = bb[i];
    if (u && u.userId) bMap.set(u.userId, u);
  }

  for (let i = 0; i < aa.length; i += 1) {
    const au = aa[i];
    if (!au || !au.userId) return false;
    const bu = bMap.get(au.userId);
    if (!bu) return false;
    if (!userShallowEqual(au, bu)) return false;
  }

  return true;
};

export default {
  userShallowEqual,
  userListComparator,
};
