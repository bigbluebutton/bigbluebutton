import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import { User } from '/imports/ui/Types/user';
import { precompareResponses } from '../../hooks/useStableResponse';
import { userComparator } from './userComparator';

export const currentUserComparator = (
  a: GraphqlDataHookSubscriptionResponse<Partial<User> | null> | null,
  b: GraphqlDataHookSubscriptionResponse<Partial<User> | null>,
) => {
  const pre = precompareResponses<Partial<User> | null>(a, b);
  if (pre === true) return true;
  if (pre === false) return false;
  const { aData, bData } = pre;

  if (aData === bData) return true;
  if (!aData && !bData) return true;
  if (!aData || !bData) return false;

  const userA = aData as Partial<User>;
  const userB = bData as Partial<User>;

  return userComparator(userA, userB);
};

export default currentUserComparator;
