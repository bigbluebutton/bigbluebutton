import { PluginProvidedState } from '/imports/ui/components/plugins-engine/types'
import React from 'react';

export interface PluginContextTypes {
    pluginProvidedState: PluginProvidedState
    setPluginProvidedState: React.Dispatch<React.SetStateAction<PluginProvidedState>>
}
