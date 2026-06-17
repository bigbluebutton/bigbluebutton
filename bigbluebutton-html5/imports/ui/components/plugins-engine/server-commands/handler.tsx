import * as React from 'react';
import PluginSaveCaptionServerCommandsManager from './caption/save/manager';
import PluginAddLocaleCaptionServerCommandsManager from './caption/add-locale/manager';
import PluginSendMessageChatServerCommandsManager from './chat/send-message/manager';
import PluginCreatePrivateChatServerCommandsManager from './chat/create-private-chat/manager';
import PluginUploadPresentationServerCommandsManager from './presentation/upload/manager';

const PluginServerCommandsHandler = () => (
  <>
    <PluginSaveCaptionServerCommandsManager />
    <PluginAddLocaleCaptionServerCommandsManager />
    <PluginSendMessageChatServerCommandsManager />
    <PluginCreatePrivateChatServerCommandsManager />
    <PluginUploadPresentationServerCommandsManager />
  </>
);

export default PluginServerCommandsHandler;
