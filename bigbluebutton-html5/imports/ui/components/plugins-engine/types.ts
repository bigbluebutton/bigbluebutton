import * as React from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

export interface PluginProvidedStateContainerProps {
    uuid: string;
}

export interface PluginsEngineComponentProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

export interface PluginConfig {
    name: string;
    url: string;
}

export interface PluginLoaderContainerProps {
    uuid: string;
    containerRef: React.RefObject<HTMLDivElement>;
    loadedPlugins: React.MutableRefObject<number>;
    setLastLoadedPlugin: React.Dispatch<React.SetStateAction<HTMLScriptElement | undefined>>;
    pluginConfig: PluginConfig;
}

export interface EffectivePluginConfig extends PluginConfig {
    uuid: string;
}

export interface PluginProvidedState {
    presentationToolbarItems: PluginSdk.PresentationToolbarItem[];
}

/**
 * @description This represents the map containing the state provided by
 * each plugin with its own UUID.
 * @example {UUID -> Plugin information} // Maps the UUID from the
 * loaded plugin to object it will render
 * {"0005538e-5844-44e4-a405-0cad635bee19": {presentationToolbarItems: [{id: "123",
 *  label: "I am a plugin", ...restOfObject}]}}
 */
export type PluginsProvidedStateMap = {
    [uuid: string]: PluginProvidedState;
}
