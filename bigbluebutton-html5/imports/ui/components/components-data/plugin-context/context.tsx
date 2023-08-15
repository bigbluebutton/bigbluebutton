import React, {
    createContext,
    useState,
} from 'react';

import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types'

import { PluginsContextType } from './types';

export const PluginsContext = createContext<PluginsContextType>({} as PluginsContextType);

export const PluginsContextProvider = (props: any) => {
  const [pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState] = useState<PluginProvidedState>(
      {} as PluginProvidedState,
    );
  return (
    <PluginsContext.Provider value={
            {
                ...props,
                setPluginsProvidedAggregatedState,
                pluginsProvidedAggregatedState,
            }
        }
    >
      {props.children}
    </PluginsContext.Provider>
  );
};
