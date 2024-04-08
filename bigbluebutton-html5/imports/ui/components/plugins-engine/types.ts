import * as React from 'react';

export interface PluginsEngineComponentProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

export interface PluginConfig {
    name: string;
    url: string;
}

export interface EffectivePluginConfig extends PluginConfig {
    name: string;
    uuid: string;
}
