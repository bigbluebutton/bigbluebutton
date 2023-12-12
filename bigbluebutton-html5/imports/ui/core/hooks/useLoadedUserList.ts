import { useContext } from 'react';

import createUseSubscription from './createUseSubscription';
import { USER_LIST_SUBSCRIPTION } from '/imports/ui/core/graphql/queries/users';
import { User } from '../../Types/user';
import { PluginsContext } from '../../components/components-data/plugin-context/context';

const createUseLoadedUserListSubscription = (
  variables: {offset: number, limit: number},
) => createUseSubscription<User>(
  USER_LIST_SUBSCRIPTION,
  { ...variables },
);

const useLoadedUserList = (fn: (c: Partial<User>) => Partial<User>) => {
  const { userListGraphqlVariables } = useContext(PluginsContext);
  const {
    offset,
    limit,
  } = userListGraphqlVariables;
  const useLoadedUserListSubscription = createUseLoadedUserListSubscription({
    offset,
    limit,
  });
  const loadedUserList = useLoadedUserListSubscription(fn);
  return loadedUserList;
};

export default useLoadedUserList;
