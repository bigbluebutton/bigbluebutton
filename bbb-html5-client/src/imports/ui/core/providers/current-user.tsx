import React, { createContext } from 'react';
import { User } from '../../Types/user';
import { GraphqlDataHookSubscriptionResponse } from '../../Types/hook';
import useCurrentUser from '../hooks/useCurrentUser';

type CurrentUserContext = GraphqlDataHookSubscriptionResponse<Partial<User>[]>;

export const CurrentUserContext = createContext<CurrentUserContext>({ loading: true });

interface CurrentUserProviderProps {
  children: React.ReactNode;
}

const CurrentUserProvider: React.FC<CurrentUserProviderProps> = (({ children }) => {
  const response = useCurrentUser();
  return (
    <CurrentUserContext.Provider value={{
      loading: response.loading,
      data: response.rawData,
      errors: response.errors,
    }}
    >
      {children}
    </CurrentUserContext.Provider>
  );
});

export default CurrentUserProvider;
