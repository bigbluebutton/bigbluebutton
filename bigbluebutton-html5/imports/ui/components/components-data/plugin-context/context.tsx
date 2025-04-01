import React, { createContext, useState } from 'react';
import { ExtensibleArea } from '/imports/ui/components/plugins-engine/extensible-areas/types';
import { PluginsContextType } from './types';
import { DomElementManipulationIdentifiers } from '../../plugins-engine/dom-element-manipulation/types';

export const PluginsContext = createContext<PluginsContextType>({} as PluginsContextType);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PluginsContextProvider = ({ children, ...props }: any) => {
  const [pluginsExtensibleAreasAggregatedState, setPluginsExtensibleAreasAggregatedState] = useState<ExtensibleArea>(
    {} as ExtensibleArea,
  );
  const [domElementManipulationIdentifiers, setDomElementManipulationIdentifiers] = useState<
    DomElementManipulationIdentifiers
  >({} as DomElementManipulationIdentifiers);
  return (
    <PluginsContext.Provider
      value={{
        ...props,
        setPluginsExtensibleAreasAggregatedState,
        pluginsExtensibleAreasAggregatedState,
        domElementManipulationIdentifiers,
        setDomElementManipulationIdentifiers,
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};
