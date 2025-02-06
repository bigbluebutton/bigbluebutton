/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable jsx-a11y/no-access-key */
import React, { useEffect } from 'react';
import { layoutSelect, layoutSelectInput, layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';
import Styled from './styles';
import PrivateChatListHeader from '../private-chats-header/component';
import { Input, Layout } from '/imports/ui/components/layout/layoutTypes';
import { Chat } from '/imports/ui/Types/chat';
import { useCreateUseSubscription } from '/imports/ui/core/hooks/createUseSubscription';
import { Message } from '/imports/ui/Types/message';
import { GraphqlDataHookSubscriptionResponse } from '/imports/ui/Types/hook';
import {
  CHAT_MESSAGE_PRIVATE_SUBSCRIPTION,
} from '/imports/ui/components/chat/chat-graphql/chat-message-list/page/queries';

interface PrivateChatListItemProps {
  chat: Partial<Chat>;
  chatNodeRef: React.Ref<HTMLButtonElement>;
  index: number;
  privateChatSelectedCallback: () => void;
}

const PrivateChatListItem = (props: PrivateChatListItemProps) => {
  const sidebarContent = layoutSelectInput((i: Input) => i.sidebarContent);
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const layoutContextDispatch = layoutDispatch();

  const { sidebarContentPanel } = sidebarContent;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  const {
    chat,
    chatNodeRef,
    index,
    privateChatSelectedCallback,
  } = props;

  const countUnreadMessages = chat.totalUnread || 0;

  const chatPanelOpen = sidebarContentIsOpen && sidebarContentPanel === PANELS.CHAT;

  const isCurrentChat = chat.chatId === idChatOpen && chatPanelOpen;

  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  const chatQuery = CHAT_MESSAGE_PRIVATE_SUBSCRIPTION;
  const defaultVariables = {
    // The || 0 is here because chat is a partial type (can have undefined fields)
    offset: (chat.totalMessages || 0) - 1,
    limit: 1,
  }; // to get only the last message from private chat
  const variables = { ...defaultVariables, requestedChatId: chat.chatId };
  const useChatMessageSubscription = useCreateUseSubscription<Message>(chatQuery, variables);
  const {
    data: chatMessageData,
  } = useChatMessageSubscription((msg) => msg) as GraphqlDataHookSubscriptionResponse<Message[]>;

  useEffect(() => {
    if (chat.chatId !== PUBLIC_GROUP_CHAT_ID && chat.chatId === idChatOpen) {
      layoutContextDispatch({
        type: ACTIONS.SET_ID_CHAT_OPEN,
        value: chat.chatId,
      });
    }
  }, [idChatOpen, sidebarContentIsOpen, sidebarContentPanel, chat]);

  const handleClickOpenPrivateChat = () => {
    layoutContextDispatch({
      type: ACTIONS.SET_ID_CHAT_OPEN,
      value: chat.chatId,
    });
    privateChatSelectedCallback();
  };

  if (!chatMessageData) return null;
  const lastMessage = chatMessageData[0]?.message;
  const lastMessageTime = new Date(chatMessageData[0]?.createdAt);

  return (
    <Styled.ChatListItem
      data-test="chatButton"
      role="button"
      aria-expanded={isCurrentChat}
      active={isCurrentChat}
      tabIndex={-1}
      onClick={handleClickOpenPrivateChat}
      id={`chat-list-${index}`}
      aria-label={chat.participant?.name}
      ref={chatNodeRef}
    >
      <Styled.ChatListItemLink>
        <Styled.ChatWrapper>
          {chat.participant && (
            <Styled.ChatHeading data-test="private-user-list-header">
              <Styled.UserAvatar
                moderator={chat.participant?.role === ROLE_MODERATOR}
                avatar={chat.participant.avatar}
                color={chat.participant.color}
              >
                {chat.participant?.avatar.length === 0 ? chat.participant?.name.toLowerCase().slice(0, 2) : ''}
              </Styled.UserAvatar>
              <PrivateChatListHeader
                name={chat.participant?.name}
                currentlyInMeeting={chat.participant?.currentlyInMeeting ?? true}
                dateTime={lastMessageTime}
              />
            </Styled.ChatHeading>
          )}
          <Styled.ChatContent data-test="private-user-list-content">
            <Styled.MessageItemWrapper>
              {lastMessage}
            </Styled.MessageItemWrapper>
            {countUnreadMessages > 0 ? (
              <Styled.UnreadMessages data-test="unreadMessages">
                <Styled.UnreadMessagesText aria-hidden="true">
                  {countUnreadMessages}
                </Styled.UnreadMessagesText>
              </Styled.UnreadMessages>
            ) : null}
          </Styled.ChatContent>
        </Styled.ChatWrapper>
      </Styled.ChatListItemLink>
    </Styled.ChatListItem>
  );
};

export default PrivateChatListItem;
