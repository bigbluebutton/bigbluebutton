import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import React from 'react';

export interface PluginContextData {
    providedPlugins: ProvidedPlugins
    setProvidedPlugins: React.Dispatch<React.SetStateAction<ProvidedPlugins>>
}

export interface ProvidedPlugins {
    whiteboardToolbarItems: PluginSdk.WhiteboardToolbarItem[];
}
