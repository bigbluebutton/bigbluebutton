import React, { createContext } from 'react';
import CURRENT_USER_SUBSCRIPTION from '../graphql/queries/currentUserSubscription';
import { useSubscription } from '../hooks/createUseSubscription';
import { User } from '../../Types/user';
import { GraphqlDataHookSubscriptionResponse } from '../../Types/hook';

type CurrentUserContext = GraphqlDataHookSubscriptionResponse<Partial<User>[]>

export const CurrentUserContext = createContext<CurrentUserContext>({ loading: true });

interface CurrentUserProviderProps {
  children: React.ReactNode;
}

const CurrentUserProvider: React.FC<CurrentUserProviderProps> = (({ children }) => {
  const response = useSubscription<User>(CURRENT_USER_SUBSCRIPTION, {}, true);
  return (
    <CurrentUserContext.Provider value={response}>
      {children}
    </CurrentUserContext.Provider>
  );
});

export default CurrentUserProvider;
