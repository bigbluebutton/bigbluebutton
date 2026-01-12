import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { User } from '/imports/ui/Types/user';
import { precompareResponses } from '/imports/ui/core/hooks/useStableResponse';
import { userComparator } from './userComparator';

export { userComparator };

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

  return false;
};

export default {
  userComparator,
  userListComparator,
};
