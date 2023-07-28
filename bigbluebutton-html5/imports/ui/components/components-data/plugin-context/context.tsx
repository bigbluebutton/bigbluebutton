import React, {
    createContext,
    useState,
} from 'react';

import { PluginContextData, ProvidedPlugins, UserListLoadedInformation } from './types';


export const PluginsContext = createContext<PluginContextData>({} as PluginContextData);

export const PluginsContextProvider = (props: any) => {
    const [providedPlugins, setProvidedPlugins] =  useState<ProvidedPlugins>({} as ProvidedPlugins);
    const [userListLoadedInformation, setUserListLoadedInformation] = useState<UserListLoadedInformation>(
        {} as UserListLoadedInformation);
    return (
        <PluginsContext.Provider value={
                {
                    ...props,
                    setProvidedPlugins,
                    providedPlugins,
                    userListLoadedInformation,
                    setUserListLoadedInformation
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
