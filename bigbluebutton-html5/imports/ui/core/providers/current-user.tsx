import React, { createContext } from 'react';
import CURRENT_USER_SUBSCRIPTION from '../graphql/queries/currentUserSubscription';
import CURRENT_UNJOINED_USER_SUBSCRIPTION from '../graphql/queries/currentUnjoinedUserSubscription';
import { useSubscription } from '../hooks/createUseSubscription';
import { User, UnjoinedUser } from '../../Types/user';
import { GraphqlDataHookSubscriptionResponse } from '../../Types/hook';

type CurrentUserContext = {
  joined: GraphqlDataHookSubscriptionResponse<User>;
  unjoined: GraphqlDataHookSubscriptionResponse<UnjoinedUser>;
};

export const CurrentUserContext = createContext<CurrentUserContext>({
  joined: { loading: true },
  unjoined: { loading: true },
});

interface CurrentUserProviderProps {
  children: React.ReactNode;
}

const CurrentUserProvider: React.FC<CurrentUserProviderProps> = (({ children }) => {
  const unjoined = useSubscription<UnjoinedUser>(
    CURRENT_UNJOINED_USER_SUBSCRIPTION,
    {},
    true,
  );
  const joined = useSubscription<User>(
    CURRENT_USER_SUBSCRIPTION,
    {},
    true,
    unjoined.loading || !unjoined.data || !unjoined.data[0].joined,
  );
  const ready = !unjoined.loading && !joined.loading;
  return ready ? (
    <CurrentUserContext.Provider
      value={{
        joined: { ...joined, data: joined.data && joined.data[0] },
        unjoined: { ...unjoined, data: unjoined.data && unjoined.data[0] },
      }}
    >
      {children}
    </CurrentUserContext.Provider>
  ) : null;
});

export default CurrentUserProvider;
