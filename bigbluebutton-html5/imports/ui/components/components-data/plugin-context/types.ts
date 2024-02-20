import { ExtensibleArea } from '/imports/ui/components/plugins-engine/extensible-areas/types';
import React from 'react';

export interface UserListGraphqlVariables {
    offset: number;
    limit: number;
}

export type ChatMessagesVariables = {
    offset: number;
    limit: number;
} | {
    requestedChatId: string;
    offset: number;
    limit: number;
}

export interface PluginsContextType {
    pluginsExtensibleAreasAggregatedState: ExtensibleArea;
    setPluginsExtensibleAreasAggregatedState: React.Dispatch<React.SetStateAction<ExtensibleArea>>;
    userListGraphqlVariables: UserListGraphqlVariables;
    setUserListGraphqlVariables: React.Dispatch<
        React.SetStateAction<UserListGraphqlVariables>>;
    domElementManipulationMessageIds: string[];
    setDomElementManipulationMessageIds: React.Dispatch<
        React.SetStateAction<string[]>>;
}
