import { useEffect } from 'react';
import * as PluginSdk from 'bigbluebutton-html-plugin-sdk';
import {
  LoadedChatMessage,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/domain/chat/loaded-chat-messages/types';
import {
  HookEvents,
} from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/enum';
import { DataConsumptionHooks } from 'bigbluebutton-html-plugin-sdk/dist/cjs/data-consumption/enums';
import { UpdatedEventDetails } from 'bigbluebutton-html-plugin-sdk/dist/cjs/core/types';
import useLoadedPageGathering from '/imports/ui/core/hooks/useLoadedChatMessages';
import { Message } from '/imports/ui/Types/message';
import formatLoadedChatMessagesDataFromGraphql from './utils';
import usePreviousValue from '/imports/ui/hooks/usePreviousValue';
import { GeneralHookManagerProps } from '../../../types';

const LoadedChatMessagesHookContainer = (props: GeneralHookManagerProps) => {
  const [chatMessagesData] = useLoadedPageGathering((message: Partial<Message>) => ({
    createdAt: message.createdAt,
    message: message.message,
    messageId: message.messageId,
    user: message.user,
    messageMetadata: message.messageMetadata,
  }));

  const { numberOfUses } = props;
  const previousNumberOfUses = usePreviousValue(numberOfUses);

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
    const previousNumberOfUsesValue = previousNumberOfUses || 0;
    if (numberOfUses > previousNumberOfUsesValue) {
      updateLoadedChatMessagesForPlugin();
    }
  }, [numberOfUses]);
  useEffect(() => {
    updateLoadedChatMessagesForPlugin();
  }, [chatMessagesData]);

  return null;
};

export default LoadedChatMessagesHookContainer;
