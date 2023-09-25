import React, { createContext, useState } from 'react';
import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types';
import { PluginsContextType, UserListGraphqlVariables } from './types';

export const PluginsContext = createContext<PluginsContextType>({} as PluginsContextType);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PluginsContextProvider = ({ children, ...props }: any) => {
  const [pluginsProvidedAggregatedState, setPluginsProvidedAggregatedState] = useState<PluginProvidedState>(
    {} as PluginProvidedState,
  );
  const [userListGraphqlVariables, setUserListGraphqlVariables] = useState<UserListGraphqlVariables>(
    {} as UserListGraphqlVariables,
  );

  return (
    <PluginsContext.Provider
      value={{
        ...props,
        setPluginsProvidedAggregatedState,
        pluginsProvidedAggregatedState,
        userListGraphqlVariables,
        setUserListGraphqlVariables,
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};
