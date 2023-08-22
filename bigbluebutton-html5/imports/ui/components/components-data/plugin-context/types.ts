import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types'
import React from 'react';

export interface InformationToLoadUserListData {
    offset: number;
    limit: number;
}

export interface PluginsContextType {
    pluginsProvidedAggregatedState: PluginProvidedState;
    setPluginsProvidedAggregatedState: React.Dispatch<React.SetStateAction<PluginProvidedState>>;
    informationToLoadUserListData: InformationToLoadUserListData;
    setInformationToLoadUserListData: React.Dispatch<
        React.SetStateAction<InformationToLoadUserListData>>;
}
