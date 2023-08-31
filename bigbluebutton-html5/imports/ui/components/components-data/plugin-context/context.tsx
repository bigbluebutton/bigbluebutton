import React, {
  createContext,
  useState,
} from 'react';

import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types'

import { PluginsContextType, UserListGraphqlVariables } from './types';

export const PluginsContext = createContext<PluginsContextType>({} as PluginsContextType);

export const PluginsContextProvider = (props: any) => {
  const [pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState] = useState<PluginProvidedState>(
      {} as PluginProvidedState,
    );
  const [userListGraphqlVariables,
    setUserListGraphqlVariables] = useState<UserListGraphqlVariables>(
      {} as UserListGraphqlVariables,
    );
  return (
    <PluginsContext.Provider value={
      {
        ...props,
        setPluginsProvidedAggregatedState,
        pluginsProvidedAggregatedState,
        userListGraphqlVariables,
        setUserListGraphqlVariables,
      }
    }
    >
      {props.children}
    </PluginsContext.Provider>
  );
};
