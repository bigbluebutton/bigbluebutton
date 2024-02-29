import * as React from 'react';
import PluginChatUiCommandsHandler from './chat/handler';
import PluginLayoutUiCommandsHandler from './layout/handler';

const PluginUiCommandsHandler = () => (
  <>
    <PluginLayoutUiCommandsHandler />
    <PluginChatUiCommandsHandler />
  </>
);

export default PluginUiCommandsHandler;
