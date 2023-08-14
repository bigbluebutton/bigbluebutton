import React, {
    createContext,
    useState,
} from 'react';

import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types'

import { PluginContextTypes } from './types';


export const PluginsContext = createContext<PluginContextTypes>({} as PluginContextTypes);

export const PluginsContextProvider = (props: any) => {
    const [pluginProvidedState, setPluginProvidedState] =  useState<PluginProvidedState>({} as PluginProvidedState);
    return (
        <PluginsContext.Provider value={
                {
                    ...props,
                    setPluginProvidedState,
                    pluginProvidedState,
                }
            }
        >
        {props.children}
        </PluginsContext.Provider>
    );
};
