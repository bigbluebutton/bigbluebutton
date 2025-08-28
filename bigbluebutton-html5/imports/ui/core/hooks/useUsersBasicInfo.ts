import { useMemo } from 'react';
import createUseSubscription from './createUseSubscription';
import { UserBasicInfo } from '../../Types/user';
import USERS_BASIC_INFO_SUBSCRIPTION from '../graphql/queries/usersBasicInfo';

const useUsersBasicInfoSubscription = createUseSubscription<UserBasicInfo>(
  USERS_BASIC_INFO_SUBSCRIPTION,
);

const useUsersBasicInfo = (fn: (c: Partial<UserBasicInfo>) => Partial<UserBasicInfo>) => {
  const response = useUsersBasicInfoSubscription(fn);
  const returnObject = useMemo(() => ({
    ...response,
    data: response.data ? response.data : undefined,
  }), [response]);
  return returnObject;
};

export default useUsersBasicInfo;
