import createUseSubscription from './createUseSubscription';
import CURRENT_USER_SUBSCRIPTION from '../graphql/queries/currentUserSubscription';
import { User } from '../../Types/user';

const useCurrentUserSubscription = createUseSubscription<User>(CURRENT_USER_SUBSCRIPTION, {}, true);

const useCurrentUser = (fn: (c: Partial<User>) => Partial<User>) => {
  const response = useCurrentUserSubscription(fn);
  const returnObject = {
    ...response,
    data: response.data?.[0],
  };
  return returnObject;
};

export default useCurrentUser;
