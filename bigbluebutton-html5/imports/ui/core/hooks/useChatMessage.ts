import createUseSubscription from './createUseSubscription';
import {
  CHAT_MESSAGE_PRIVATE_SUBSCRIPTION,
  CHAT_MESSAGE_PUBLIC_SUBSCRIPTION,
} from '/imports/ui/components/chat/chat-graphql/chat-message-list/page/queries';
import { Message } from '/imports/ui/Types/message';

const useChatMessageSubscription = (
  isPublicChat: boolean,
  variables: object | undefined,
) => createUseSubscription<Partial<Message>>(
  isPublicChat ? CHAT_MESSAGE_PUBLIC_SUBSCRIPTION : CHAT_MESSAGE_PRIVATE_SUBSCRIPTION,
  variables,
  true,
);

const useChatMessage = (
  fn: (c: Partial<Message>) => Partial<Message>,
  isPublicChat: boolean,
  variables?: object,
): Array<Partial<Message>> => {
  const chatMessages = useChatMessageSubscription(isPublicChat, variables)(fn);
  return chatMessages;
};

export default useChatMessage;
