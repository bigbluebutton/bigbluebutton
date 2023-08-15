import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types'
import React from 'react';

export interface PluginsContextType {
    pluginsProvidedAggregatedState: PluginProvidedState;
    setPluginsProvidedAggregatedState: React.Dispatch<React.SetStateAction<PluginProvidedState>>;
}
