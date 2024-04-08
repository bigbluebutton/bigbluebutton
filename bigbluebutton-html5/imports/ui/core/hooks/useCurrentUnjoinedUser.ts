import { useContext } from 'react';
import { UnjoinedUser } from '../../Types/user';
import { CurrentUserContext } from '../providers/current-user';

const useCurrentUnjoinedUser = <P extends (user: UnjoinedUser) => ReturnType<P>>(projection: P) => {
  const { unjoined } = useContext(CurrentUserContext);
  return {
    ...unjoined,
    data: unjoined.data ? [unjoined.data].map(projection)[0] : null,
  };
};

export default useCurrentUnjoinedUser;
