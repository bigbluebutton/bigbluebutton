import React, { createContext, useState } from 'react';
import { ExtensibleArea } from '/imports/ui/components/plugins-engine/extensible-areas/types';
import { ChatMessagesGraphqlVariablesAndQuery, PluginsContextType, UserListGraphqlVariables } from './types';
import { CHAT_MESSAGE_PUBLIC_SUBSCRIPTION } from '../../chat/chat-graphql/chat-message-list/page/queries';

export const PluginsContext = createContext<PluginsContextType>({} as PluginsContextType);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const PluginsContextProvider = ({ children, ...props }: any) => {
  const [pluginsExtensibleAreasAggregatedState, setPluginsExtensibleAreasAggregatedState] = useState<ExtensibleArea>(
    {} as ExtensibleArea,
  );
  const [userListGraphqlVariables, setUserListGraphqlVariables] = useState<UserListGraphqlVariables>(
    {} as UserListGraphqlVariables,
  );
  const [domElementManipulationMessageIds, setDomElementManipulationMessageIds] = useState<string[]>([]);
  const [
    chatMessagesGraphqlVariablesAndQuery,
    setChatMessagesGraphqlVariablesAndQuery,
  ] = useState<ChatMessagesGraphqlVariablesAndQuery>(
    { query: CHAT_MESSAGE_PUBLIC_SUBSCRIPTION } as ChatMessagesGraphqlVariablesAndQuery,
  );

  return (
    <PluginsContext.Provider
      value={{
        ...props,
        setPluginsExtensibleAreasAggregatedState,
        pluginsExtensibleAreasAggregatedState,
        userListGraphqlVariables,
        setUserListGraphqlVariables,
        chatMessagesGraphqlVariablesAndQuery,
        setChatMessagesGraphqlVariablesAndQuery,
        domElementManipulationMessageIds,
        setDomElementManipulationMessageIds,
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};
