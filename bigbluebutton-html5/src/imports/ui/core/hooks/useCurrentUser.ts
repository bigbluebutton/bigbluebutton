import { useMemo } from 'react';
import { User } from '../../Types/user';
import createUseSubscription from './createUseSubscription';
import CURRENT_USER_SUBSCRIPTION from '../graphql/queries/currentUserSubscription';

const currentUserSubscription = createUseSubscription<User>(CURRENT_USER_SUBSCRIPTION, {}, true);
const useCurrentUser = (fn: (c: Partial<User>) => Partial<User> = (u) => u) => {
  const response = currentUserSubscription(fn);
  const returnObject = useMemo(() => ({
    ...response,
    data: response.data ? response.data[0] : null,
    rawData: response.data ?? null,
  }), [response]);
  return returnObject;
};

export default useCurrentUser;
