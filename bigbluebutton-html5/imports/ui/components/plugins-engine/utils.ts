import { PluginApi } from 'bigbluebutton-html-plugin-sdk';
import logger from '/imports/startup/client/logger';

function setLogger(pluginApi: PluginApi) {
  const overridePluginApi = pluginApi;
  overridePluginApi.logger = logger.getPluginLogger();
}

export default setLogger;
