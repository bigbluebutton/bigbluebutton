import * as React from 'react';
import * as ReactDOMClient from 'react-dom/client';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';

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
    name: string;
    uuid: string;
}

export interface PluginsLoadingProgress {
    startedAt: number;
    totalNumberOfPlugins: number;
    pendingPluginNamesByUuid: Map<string, string>;
    loadedPluginNames: string[];
    failedPluginNames: string[];
}

// React and ReactDOM are already declared as globals by their type packages.
declare global {
  interface Window {
    ReactDOMClient: typeof ReactDOMClient;
    BbbPluginSdk: typeof PluginSdk;
  }
}
