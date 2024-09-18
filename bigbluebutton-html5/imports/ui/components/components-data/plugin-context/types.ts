import { DomElementManipulationIdentifiers } from '../../plugins-engine/dom-element-manipulation/types';
import { ExtensibleArea } from '/imports/ui/components/plugins-engine/extensible-areas/types';

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
    domElementManipulationIdentifiers: DomElementManipulationIdentifiers;
    setDomElementManipulationIdentifiers: React.Dispatch<React.SetStateAction<DomElementManipulationIdentifiers>>;
}
