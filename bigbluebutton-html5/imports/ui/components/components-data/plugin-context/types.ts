import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types'
import React from 'react';

export interface PluginContextData {
    providedPlugins: PluginProvidedState
    setProvidedPlugins: React.Dispatch<React.SetStateAction<PluginProvidedState>>
}
