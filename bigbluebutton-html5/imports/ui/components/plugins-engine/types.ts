import * as React from 'react';

import { Console, External } from '/imports/ui/Types/meetingClientSettings';

export interface PluginsEngineComponentProps {
    containerRef: React.RefObject<HTMLDivElement>;
}

export interface PluginConfigFromGraphql {
    javascriptEntrypointUrl: string;
    localesBaseUrl: string;
    loggerSettings: LoggerSettings
    loadFailureReason: string;
    loadFailureSource: string;
    name: string;
}

export interface LoggerSettings {
    console?: Partial<Console>;
    external?: Partial<External>;
}

export interface PluginsEngineManagerProps {
    pluginConfig: PluginConfigFromGraphql[] | undefined;
}

export interface PluginConfig {
    name: string;
    url: string;
    loggerSettings: LoggerSettings;
    javascriptEntrypointIntegrity?: string;
    localesBaseUrl: string
}

export interface EffectivePluginConfig extends PluginConfig {
    uuid: string;
}
