import { useMemo } from 'react';
import createUseSubscription from './createUseSubscription';
import CHATS_SUBSCRIPTION from '../graphql/queries/chatSubscription';
import { GraphqlDataHookSubscriptionResponse } from '../../Types/hook';
import { Chat } from '../../Types/chat';

// order by public, totalUnread, participant.nameSortable, participant.userId
const sortChats = (a: Partial<Chat>, b: Partial<Chat>): number => {
  if (a.public !== b.public) return a.public ? -1 : 1;
  const unreadA = a.totalUnread ?? 0;
  const unreadB = b.totalUnread ?? 0;
  if (unreadA !== unreadB) return unreadB - unreadA;
  const nameA = a.participant?.nameSortable ?? '';
  const nameB = b.participant?.nameSortable ?? '';
  if (nameA !== nameB) return nameA.localeCompare(nameB, 'en', { sensitivity: 'base' });
  const idA = a.participant?.userId ?? '';
  const idB = b.participant?.userId ?? '';
  return idA.localeCompare(idB, 'en', { numeric: true });
};

const useChatSubscription = createUseSubscription<Chat>(CHATS_SUBSCRIPTION);

interface ChatHookOptions {
  chatId?: string;
  skip?: boolean;
}

const useChat = (
  fn: (c: Partial<Chat>)=> Partial<Chat>,
  options?: ChatHookOptions,
): GraphqlDataHookSubscriptionResponse<Array<Partial<Chat>> | Partial<Chat>> => {
  const { chatId, skip = false } = options || {};

  const subscriptionResponse = useChatSubscription(fn, skip);

  const response = subscriptionResponse;

  const sortedData = useMemo(
    () => [...response.data ?? []].sort(sortChats),
    [response.data],
  );

  if (!response.data) return response;

  if (chatId) {
    const selectedChat = response.data.find((c: Partial<Chat>) => {
      return c.chatId === chatId;
    }) ?? null;
    return {
      ...response,
      data: selectedChat,
    } as GraphqlDataHookSubscriptionResponse<Array<Chat> | Chat>;
  }

  return {
    ...response,
    data: sortedData,
  } as GraphqlDataHookSubscriptionResponse<Array<Chat> | Chat>;
};

export default useChat;
