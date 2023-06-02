import Storage from '/imports/ui/services/storage/session';
import { indexOf } from '/imports/utils/array-utils';

// old code
const CLOSED_CHAT_LIST_KEY = 'closedChatList';
export const closePrivateChat = (chatId: string) => {
  const currentClosedChats = (Storage.getItem(CLOSED_CHAT_LIST_KEY) || []) as string[];

  if (indexOf(currentClosedChats, chatId) < 0) {
    currentClosedChats.push(chatId);

    Storage.setItem(CLOSED_CHAT_LIST_KEY, currentClosedChats);
  }
};