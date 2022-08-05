import {
  useState, useContext, useRef, useEffect,
} from 'react';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import { throttle } from 'lodash';

const USER_JOIN_UPDATE_THROTTLE_TIME = 1000;

export default function useContextUsers() {
  const usingUsersContext = useContext(UsersContext);
  const { users: contextUsers } = usingUsersContext;

  const [users, setUsers] = useState(null);
  const [isReady, setIsReady] = useState(true);

  const throttledSetUsers = useRef(throttle(() => {
    setUsers(contextUsers);
    setIsReady(true);
  },
  USER_JOIN_UPDATE_THROTTLE_TIME, { trailing: true }));

  useEffect(() => {
    setIsReady(false);
    throttledSetUsers.current();
  }, [contextUsers]);

  return {
    users,
    isReady,
  };
}
