import * as React from 'react';

export interface PluginsEngineComponentProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

export interface PluginConfigFromGraphql {
    javascriptEntrypointUrl: string;
    localesBaseUrl: string;
    loadFailureReason: string;
    loadFailureSource: string;
    name: string;
}

export interface PluginsEngineManagerProps {
    pluginConfig: PluginConfigFromGraphql[] | undefined;
}

export interface PluginConfig {
    name: string;
    url: string;
    javascriptEntrypointIntegrity?: string;
    localesBaseUrl: string
}

export interface EffectivePluginConfig extends PluginConfig {
    uuid: string;
}
