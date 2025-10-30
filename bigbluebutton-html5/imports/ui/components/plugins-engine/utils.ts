import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import logger from '/imports/startup/client/logger';

function setLogger(pluginApi: PluginApi) {
  const overridePluginApi = pluginApi;
  const { pluginName } = pluginApi;
  overridePluginApi.logger = logger.getPluginLogger(pluginName || '');
}

export default setLogger;
