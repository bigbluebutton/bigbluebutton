import React, {
  createContext,
  useState,
} from 'react';

import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types'

import { PluginsContextType, InformationToLoadUserListData } from './types';

export const PluginsContext = createContext<PluginsContextType>({} as PluginsContextType);

export const PluginsContextProvider = (props: any) => {
  const [pluginsProvidedAggregatedState,
    setPluginsProvidedAggregatedState] = useState<PluginProvidedState>(
      {} as PluginProvidedState,
    );
  const [informationToLoadUserListData,
    setInformationToLoadUserListData] = useState<InformationToLoadUserListData>(
      {} as InformationToLoadUserListData,
    );
  return (
    <PluginsContext.Provider value={
      {
        ...props,
        setPluginsProvidedAggregatedState,
        pluginsProvidedAggregatedState,
        informationToLoadUserListData,
        setInformationToLoadUserListData,
      }
    }
    >
      {props.children}
    </PluginsContext.Provider>
  );
};
