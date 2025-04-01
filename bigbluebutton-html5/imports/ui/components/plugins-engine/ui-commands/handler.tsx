import * as React from 'react';
import PluginChatUiCommandsHandler from './chat/handler';
import PluginSidekickOptionsContainerUiCommandsHandler from './sidekick-options-container/handler';
import PluginPresentationAreaUiCommandsHandler from './presentation/handler';
import PluginUserStatusUiCommandsHandler from './user-status/handler';
import PluginConferenceUiCommandsHandler from './conference/handler';
import { PluginNotificationUiCommandsHandler } from './notification/handler';
import { PluginLayoutUiCommandsHandler } from './layout/handler';
import PluginNavBarUiCommandsHandler from './nav-bar/handler';
import PluginActionsBarUiCommandsHandler from './actions-bar/handler';
import PluginCameraUiCommandsHandler from './camera/handler';

const PluginUiCommandsHandler = () => (
  <>
    <PluginActionsBarUiCommandsHandler />
    <PluginLayoutUiCommandsHandler />
    <PluginChatUiCommandsHandler />
    <PluginCameraUiCommandsHandler />
    <PluginNavBarUiCommandsHandler />
    <PluginSidekickOptionsContainerUiCommandsHandler />
    <PluginPresentationAreaUiCommandsHandler />
    <PluginUserStatusUiCommandsHandler />
    <PluginConferenceUiCommandsHandler />
    <PluginNotificationUiCommandsHandler />
  </>
);

export default PluginUiCommandsHandler;
