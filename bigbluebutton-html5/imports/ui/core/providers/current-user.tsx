import React, { createContext } from 'react';
import CURRENT_USER_SUBSCRIPTION from '../graphql/queries/currentUserSubscription';
import { useSubscription } from '../hooks/createUseSubscription';
import { User } from '../../Types/user';
import { GraphqlDataHookSubscriptionResponse } from '../../Types/hook';

type CurrentUserContext = GraphqlDataHookSubscriptionResponse<User>

export const CurrentUserContext = createContext<CurrentUserContext>({ loading: true });

interface CurrentUserProviderProps {
  children: React.ReactNode;
}

const CurrentUserProvider: React.FC<CurrentUserProviderProps> = (({ children }) => {
  const response = useSubscription<User>(CURRENT_USER_SUBSCRIPTION, {}, true);
  const { data } = response;
  return (
    <CurrentUserContext.Provider value={{ ...response, data: data && data[0] }}>
      {children}
    </CurrentUserContext.Provider>
  );
});

export default CurrentUserProvider;
