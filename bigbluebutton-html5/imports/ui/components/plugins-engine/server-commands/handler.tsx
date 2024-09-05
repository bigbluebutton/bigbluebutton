import * as React from 'react';
import PluginSaveCaptionServerCommandsManager from './caption/save/manager';
import PluginAddLocaleCaptionServerCommandsManager from './caption/add-locale/manager';
import PluginSendMessageChatServerCommandsManager from './chat/send-message/manager';

const PluginServerCommandsHandler = () => (
  <>
    <PluginSaveCaptionServerCommandsManager />
    <PluginAddLocaleCaptionServerCommandsManager />
    <PluginSendMessageChatServerCommandsManager />
  </>
);

export default PluginServerCommandsHandler;
