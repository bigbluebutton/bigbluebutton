import { useContext } from 'react';
import { User } from '../../Types/user';
import { CurrentUserContext } from '../providers/current-user';

const useCurrentUser = <P extends (user: User) => ReturnType<P>>(projection: P) => {
  const response = useContext(CurrentUserContext);
  return {
    ...response,
    data: response.data ? [response.data].map(projection)[0] : null,
  };
};

export default useCurrentUser;
