import { useContext } from 'react';
import { User } from '../../Types/user';
import { CurrentUserContext } from '../providers/current-user';

const useCurrentUser = (fn: (c: Partial<User>) => Partial<User> = (u) => u) => {
  const response = useContext(CurrentUserContext);
  const returnObject = {
    ...response,
    data: response.data ? response.data.map(fn)[0] : null,
  };
  return returnObject;
};

export default useCurrentUser;
