import { useContext } from 'react';
import { User } from '../../Types/user';
import { CurrentUserContext } from '../providers/current-user';

const useCurrentUser = <P extends (user: User) => ReturnType<P>>(projection: P) => {
  const { joined } = useContext(CurrentUserContext);
  return {
    ...joined,
    data: joined.data ? [joined.data].map(projection)[0] : null,
  };
};

export default useCurrentUser;
