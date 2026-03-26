/* eslint-disable @typescript-eslint/ban-ts-comment */
/* eslint-disable jsx-a11y/no-access-key */
import React, { useEffect } from 'react';
import { defineMessages, useIntl } from 'react-intl';
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

const intlMessages = defineMessages({
  privateChatUnkownUser: {
    id: 'app.userList.chatListItem.unknownParticipant',
  },
  privateChatAriaLabelNoUnread: {
    id: 'app.userList.chatListItem.noUnread',
  },
  privateChatAriaLabelSingular: {
    id: 'app.userList.chatListItem.unreadSingular',
  },
  privateChatAriaLabelPlural: {
    id: 'app.userList.chatListItem.unreadPlural',
  },
});

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
  const chatCountTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const [unreadMessagesToDisplay, setUnreadMessagesToDisplay] = React.useState(0);
  const intl = useIntl();

  const { sidebarContentPanel } = sidebarContent;
  const sidebarContentIsOpen = sidebarContent.isOpen;

  const {
    chat,
    chatNodeRef,
    index,
    privateChatSelectedCallback,
  } = props;

  const chatPanelOpen = sidebarContentIsOpen && sidebarContentPanel === PANELS.CHAT;

  const isCurrentChat = chat.chatId === idChatOpen && chatPanelOpen;

  const ROLE_MODERATOR = window.meetingClientSettings.public.user.role_moderator;

  const CHAT_CONFIG = window.meetingClientSettings.public.chat;
  const PUBLIC_GROUP_CHAT_ID = CHAT_CONFIG.public_group_id;

  const chatQuery = CHAT_MESSAGE_PRIVATE_SUBSCRIPTION;
  const totalMessages = chat.totalMessages || 0;
  // Ensure offset is never negative (happens when chat is empty)
  const offset = totalMessages > 0 ? totalMessages - 1 : 0;
  const defaultVariables = {
    offset,
    limit: 1,
  }; // to get only the last message from private chat
  const variables = { ...defaultVariables, requestedChatId: chat.chatId };
  // Skip subscription if chat has no messages
  const skipSubscription = totalMessages === 0;
  const useChatMessageSubscription = useCreateUseSubscription<Message>(chatQuery, variables);
  const {
    data: chatMessageData,
  } = useChatMessageSubscription((msg) => msg, skipSubscription) as GraphqlDataHookSubscriptionResponse<Message[]>;

  useEffect(() => {
    // Clear any previous timeout to prevent multiple executions
    clearTimeout(chatCountTimeoutRef.current);
    if (chat.totalUnread !== undefined && chat.totalUnread !== unreadMessagesToDisplay) {
      // Only update the unread count if the user is actively receiving new messages (not when they're reading)
      if (isCurrentChat && chat.totalUnread > 0) {
        // Delay updating the unread count by 2 seconds when the user is viewing this chat
        // This delay prevents showing the unread count while the user is already viewing the chat,
        // but the UpdateChatLastSeen mutation hasn't been triggered yet.
        // This delay is also implemented for performance reasons, as we're transferring this behavior from the server.
        chatCountTimeoutRef.current = setTimeout(() => {
          setUnreadMessagesToDisplay(chat.totalUnread ?? 0);
        }, 2000);
      } else {
        // Immediately update the unread count if the user is not viewing the chat or if there are no new messages
        setUnreadMessagesToDisplay(chat.totalUnread);
      }
    }

    return () => {
      if (chatCountTimeoutRef.current) {
        clearTimeout(chatCountTimeoutRef.current);
        chatCountTimeoutRef.current = undefined;
      }
    };
  }, [chat.totalUnread, isCurrentChat, unreadMessagesToDisplay]);

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

  const unreadCount = unreadMessagesToDisplay;
  const participantName = chat.participant?.name || intl.formatMessage(intlMessages.privateChatUnkownUser);
  const noUnreadMessagesLabel = intl.formatMessage(intlMessages.privateChatAriaLabelNoUnread);
  const unreadMessagesLabel = intl.formatMessage(
    unreadCount > 1
      ? intlMessages.privateChatAriaLabelPlural
      : intlMessages.privateChatAriaLabelSingular, {
      unreadCount,
    },
  );
  const ariaLabel = unreadCount > 0 ? unreadMessagesLabel : noUnreadMessagesLabel;

  // Handle empty chats (no messages yet)
  const hasMessages = chatMessageData && chatMessageData.length > 0;
  const lastMessage = hasMessages ? chatMessageData[0]?.message : '';
  const lastMessageTime = hasMessages ? new Date(chatMessageData[0]?.createdAt) : null;

  return (
    <Styled.ChatListItem
      data-test="privateChatItem"
      role="button"
      aria-expanded={isCurrentChat}
      active={isCurrentChat}
      tabIndex={-1}
      onClick={handleClickOpenPrivateChat}
      id={`chat-list-${index}`}
      aria-label={participantName}
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
          {(hasMessages || unreadMessagesToDisplay > 0) && (
            <Styled.ChatContent data-test="private-user-list-content">
              <Styled.MessageItemWrapper>
                {lastMessage}
              </Styled.MessageItemWrapper>
              {(unreadMessagesToDisplay > 0)
                ? (
                  <Styled.UnreadMessages data-test="unreadMessages" aria-label={ariaLabel}>
                    <Styled.UnreadMessagesText aria-hidden="true">
                      {unreadMessagesToDisplay}
                    </Styled.UnreadMessagesText>
                  </Styled.UnreadMessages>
                )
                : null}
            </Styled.ChatContent>
          )}
        </Styled.ChatWrapper>
      </Styled.ChatListItemLink>
    </Styled.ChatListItem>
  );
};

export default PrivateChatListItem;
