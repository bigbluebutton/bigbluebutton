import * as React from 'react';
import PluginChatUiCommandsHandler from './chat/handler';
import PluginSidekickOptionsContainerUiCommandsHandler from './sidekick-options-container/handler';
import PluginPresentationAreaUiCommandsHandler from './presentation/handler';
import PluginUserStatusUiCommandsHandler from './user-status/handler';
import PluginConferenceUiCommandsHandler from './conference/handler';
import PluginNotificationUiCommandsHandler from './notification/handler';
import { PluginLayoutUiCommandsHandler } from './layout/handler';

const PluginUiCommandsHandler = () => (
  <>
    <PluginLayoutUiCommandsHandler />
    <PluginChatUiCommandsHandler />
    <PluginSidekickOptionsContainerUiCommandsHandler />
    <PluginPresentationAreaUiCommandsHandler />
    <PluginUserStatusUiCommandsHandler />
    <PluginConferenceUiCommandsHandler />
    <PluginNotificationUiCommandsHandler />
  </>
);

export default PluginUiCommandsHandler;
