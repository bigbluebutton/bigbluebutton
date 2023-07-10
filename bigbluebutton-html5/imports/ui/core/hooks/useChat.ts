import { createUseSubsciption } from "./createUseSubscription";
import { CHATS_SUBSCRIPTION } from "../graphql/queries/chatSubscription";
import { Chat } from "../../Types/chat";

const useChatSubscription = createUseSubsciption<Partial<Chat>>(CHATS_SUBSCRIPTION);

const useChat = (fn: (c: Partial<Chat>)=> Partial<Chat>, chatId?: string ): Array<Partial<Chat>> | Partial<Chat> | null =>{
  const chats = useChatSubscription(fn);
  if (chatId) {
    return chats.find((c) => {
      return c.chatId === chatId
    }) ?? null;
  }
  return chats;
};

export default useChat;