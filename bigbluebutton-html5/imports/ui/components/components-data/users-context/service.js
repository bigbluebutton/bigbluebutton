import { useState, useContext, useEffect } from 'react';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';

const USER_JOIN_UPDATE_TIMEOUT = 1000;
let updateTimeout = null;

export default function useContextUsers() {
  const usingUsersContext = useContext(UsersContext);
  const { users: contextUsers } = usingUsersContext;

  const [users, setUsers] = useState(null);
  const [isReady, setIsReady] = useState(true);

  useEffect(() => {
    setIsReady(false);

    if (updateTimeout) {
      clearTimeout(updateTimeout);
    }

    updateTimeout = setTimeout(() => {
      setUsers(contextUsers);
      setIsReady(true);
    }, USER_JOIN_UPDATE_TIMEOUT);
  }, [contextUsers]);

  return {
    users,
    isReady,
  };
}
