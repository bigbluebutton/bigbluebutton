import { ExtensibleArea } from '/imports/ui/components/plugins-engine/extensible-areas/types';
import React from 'react';

export interface UserListGraphqlVariables {
    offset: number;
    limit: number;
}

export interface PluginsContextType {
    pluginsExtensibleAreasAggregatedState: ExtensibleArea;
    setPluginsExtensibleAreasAggregatedState: React.Dispatch<React.SetStateAction<ExtensibleArea>>;
    userListGraphqlVariables: UserListGraphqlVariables;
    setUserListGraphqlVariables: React.Dispatch<
        React.SetStateAction<UserListGraphqlVariables>>;
}
