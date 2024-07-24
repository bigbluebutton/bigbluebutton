import { useEffect } from 'react';
import { ChatSendMessageEventArguments } from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/chat/types';
import { useMutation } from '@apollo/client';
import {
  ChatCommandsEnum,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/server-commands/chat/enum';
import SEND_MESSAGE from './mutations';

const PluginSendMessageChatServerCommandsManager = () => {
  const [sendMessage] = useMutation(SEND_MESSAGE);
  const handleSendMessage = ((
    event: CustomEvent<ChatSendMessageEventArguments>,
  ) => {
    sendMessage({
      variables: {
        chatId: event.detail.chatId,
        chatMessageInMarkdownFormat: event.detail.textMessageInMarkdownFormat,
        pluginName: event.detail.pluginName,
        pluginCustomMetadata: event.detail?.pluginCustomMetadata,
      },
    });
  }) as EventListener;

  useEffect(() => {
    window.addEventListener(ChatCommandsEnum.SEND_MESSAGE, handleSendMessage);

    return () => {
      window.removeEventListener(ChatCommandsEnum.SEND_MESSAGE, handleSendMessage);
    };
  }, []);
  return null;
};

export default PluginSendMessageChatServerCommandsManager;
