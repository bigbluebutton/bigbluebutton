import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import { PluginApiMap } from './types';

export const pluginApisSingleton: PluginApiMap = {};

export const getPluginApi = (pluginUuid: string) => pluginApisSingleton[pluginUuid];

export const appendPluginApi = (pluginApi: PluginApi, pluginUuid: string) => {
  pluginApisSingleton[pluginUuid] = pluginApi;
};
