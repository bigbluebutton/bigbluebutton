import { useContext } from 'react';
import { DocumentNode } from 'graphql';
import { Message } from '/imports/ui/Types/message';
import createUseSubscription from './createUseSubscription';
import { PluginsContext } from '../../components/components-data/plugin-context/context';
import { ChatMessagesVariables } from '../../components/components-data/plugin-context/types';

const createUseLoadedChatMessagesSubscription = (
  query: DocumentNode,
  variables: ChatMessagesVariables,
) => createUseSubscription<Message>(
  query,
  { ...variables },
);

const useLoadedChatMessages = (fn: (c: Partial<Message>) => Partial<Message>) => {
  const { chatMessagesGraphqlVariablesAndQuery } = useContext(PluginsContext);
  const {
    query,
    variables,
  } = chatMessagesGraphqlVariablesAndQuery;
  const useLoadedChatMessagesSubscription = createUseLoadedChatMessagesSubscription(query, variables);
  const loadedChatMessages = useLoadedChatMessagesSubscription(fn);
  return loadedChatMessages;
};

export default useLoadedChatMessages;
