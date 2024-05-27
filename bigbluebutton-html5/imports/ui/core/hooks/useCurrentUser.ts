import { useMemo } from 'react';
import { User } from '../../Types/user';
import { useCreateUseSubscription } from './createUseSubscription';
import CURRENT_USER_SUBSCRIPTION from '../graphql/queries/currentUserSubscription';

const useCurrentUser = (fn: (c: Partial<User>) => Partial<User> = (u) => u) => {
  const currenUserSubscription = useCreateUseSubscription<User>(CURRENT_USER_SUBSCRIPTION, {}, true);
  const response = currenUserSubscription(fn);
  const returnObject = useMemo(() => ({
    ...response,
    data: response.data ? response.data[0] : null,
    rawData: response.data ?? null,
  }), [response]);
  return returnObject;
};

export default useCurrentUser;
