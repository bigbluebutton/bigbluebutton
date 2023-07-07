import React, {
    createContext,
    useState,
} from 'react';

import { PluginContextData, ProvidedPlugins } from './types';


export const PluginsContext = createContext<PluginContextData>({} as PluginContextData);

export const PluginsContextProvider = (props: any) => {
    const [providedPlugins, setProvidedPlugins] =  useState<ProvidedPlugins>({} as ProvidedPlugins);
    return (
        <PluginsContext.Provider value={
                {
                    ...props,
                    setProvidedPlugins,
                    providedPlugins,
                }
            }
        >
        {props.children}
        </PluginsContext.Provider>
    );
};

export default {
    PluginsContextProvider,
};
