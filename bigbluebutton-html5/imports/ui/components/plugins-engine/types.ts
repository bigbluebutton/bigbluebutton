import * as React from 'react';

export interface PluginsEngineComponentProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

export interface PluginConfig {
    name: string;
    url: string;
    checksum?: string;
}

export interface EffectivePluginConfig extends PluginConfig {
    name: string;
    uuid: string;
}
