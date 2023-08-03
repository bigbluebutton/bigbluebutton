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
    pluginConfig: PluginConfig
}

export interface PluginEngineProps {
    onReady: Function
}

export interface PluginConfig {
    name: string
    url: string
}

export interface EffectivePluginConfig extends PluginConfig {
    uuid: string
}

export interface PluginObjects {
    whiteboardToolbarItems: PluginSdk.WhiteboardToolbarItem[]
}

/**
 * @description This represents the map containing the state provided by 
 * each plugin with its own UUID.
 * @example {UUID -> Plugin information} // Maps the UUID from the loaded plugin to object it will render
 * {"0005538e-5844-44e4-a405-0cad635bee19": {whiteboardToolbarItems: [{id: "123", 
 *  label: "I am a plugin", ...restOfObject}]}}
 */
export type PluginsProvidedStateMap = {
    [uuid: string]: PluginObjects
}
