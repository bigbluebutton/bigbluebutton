import * as React from 'react';
import PluginChatUiCommandsHandler from './chat/handler';
import PluginSidekickOptionsContainerUiCommandsHandler from './sidekick-options-container/handler';

const PluginUiCommandsHandler = () => (
  <>
    <PluginChatUiCommandsHandler />
    <PluginSidekickOptionsContainerUiCommandsHandler />
  </>
);

export default PluginUiCommandsHandler;
