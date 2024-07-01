import * as React from 'react';
import PluginSaveCaptionServerCommandsManager from './caption/save/manager';
import PluginAddLocaleCaptionServerCommandsManager from './caption/add-locale/manager';

const PluginServerCommandsHandler = () => (
  <>
    <PluginSaveCaptionServerCommandsManager />
    <PluginAddLocaleCaptionServerCommandsManager />
  </>
);

export default PluginServerCommandsHandler;
