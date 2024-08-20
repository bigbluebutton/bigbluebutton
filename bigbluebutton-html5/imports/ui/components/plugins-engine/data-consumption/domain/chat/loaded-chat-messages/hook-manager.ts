import { useEffect, useState } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  LoadedChatMessage,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/chat/loaded-chat-messages/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { SubscribedEventDetails, UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import useLoadedPageGathering from '/imports/ui/core/hooks/useLoadedChatMessages';
import { Message } from '/imports/ui/Types/message';
import formatLoadedChatMessagesDataFromGraphql from './utils';

const LoadedChatMessagesHookContainer = () => {
  const [sendSignal, setSendSignal] = useState(false);
  const [chatMessagesData] = useLoadedPageGathering((message: Partial<Message>) => ({
    createdAt: message.createdAt,
    message: message.message,
    messageId: message.messageId,
    user: message.user,
    messageMetadata: message.messageMetadata,
  }));

  const updateLoadedChatMessagesForPlugin = () => {
    window.dispatchEvent(new CustomEvent<
      UpdatedEventDetails<PluginSdk.GraphqlResponseWrapper<LoadedChatMessage[]>>
    >(HookEvents.BBB_CORE_SENT_NEW_DATA, {
      detail: {
        data: formatLoadedChatMessagesDataFromGraphql(chatMessagesData),
        hook: DataConsumptionHooks.LOADED_CHAT_MESSAGES,
      },
    }));
  };

  useEffect(() => {
    updateLoadedChatMessagesForPlugin();
  }, [chatMessagesData, sendSignal]);

  useEffect(() => {
    const updateHookUseLoadedChatMessages = ((event: CustomEvent<SubscribedEventDetails>) => {
      if (event.detail.hook === DataConsumptionHooks.LOADED_CHAT_MESSAGES) setSendSignal((signal) => !signal);
    }) as EventListener;
    window.addEventListener(
      HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseLoadedChatMessages,
    );
    return () => {
      window.removeEventListener(
        HookEvents.PLUGIN_SUBSCRIBED_TO_BBB_CORE, updateHookUseLoadedChatMessages,
      );
    };
  }, []);

  return null;
};

export default LoadedChatMessagesHookContainer;
