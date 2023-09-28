import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types';
import React from 'react';

export interface UserListGraphqlVariables {
    offset: number;
    limit: number;
}

export interface PluginsContextType {
    pluginsProvidedAggregatedState: PluginProvidedState;
    setPluginsProvidedAggregatedState: React.Dispatch<React.SetStateAction<PluginProvidedState>>;
    userListGraphqlVariables: UserListGraphqlVariables;
    setUserListGraphqlVariables: React.Dispatch<
        React.SetStateAction<UserListGraphqlVariables>>;
}
