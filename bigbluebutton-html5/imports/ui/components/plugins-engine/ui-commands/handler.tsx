import * as React from 'react';
import PluginChatUiCommandsHandler from './chat/handler';
import PluginUserListUiCommandsHandler from './user-list/handler';

const PluginUiCommandsHandler = () => (
  <>
    <PluginChatUiCommandsHandler />
    <PluginUserListUiCommandsHandler />
  </>
);

export default PluginUiCommandsHandler;
