import * as React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

export interface PluginProvidedStateProps {
    uuid: string
}

export interface PluginsEngineComponentProps {
    containerRef: React.RefObject<HTMLDivElement>
}

export interface PluginLoaderComponentProps {
    uuid: string
    containerRef: React.RefObject<HTMLDivElement>
    loadedPlugins: React.MutableRefObject<number>
    setLastLoadedPlugin: React.Dispatch<React.SetStateAction<HTMLScriptElement | undefined>>
    pluginConfigSettings: PluginConfigSetting
}

export interface PluginEngineProps {
    onReady: Function
}

export interface PluginConfigSetting {
    name: string
    url: string
}

export interface UniquePluginConfigSetting {
    name: string
    url: string
    uuid: string
}

export interface PluginObjects {
    whiteboardToolbarItems: PluginSdk.WhiteboardToolbarItem[]
    userListDropdownItems: PluginSdk.UserListDropdownItemWrapper[]
}

export type PluginProvidedStateStaticData = {
    [uuid: string]: PluginObjects
}
