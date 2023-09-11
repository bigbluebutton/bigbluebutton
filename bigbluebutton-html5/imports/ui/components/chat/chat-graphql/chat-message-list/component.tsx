import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { Meteor } from 'meteor/meteor';
import { makeVar, useMutation } from '@apollo/client';
import { LAST_SEEN_MUTATION } from './queries';
import {
  ButtonLoadMore,
  MessageList,
  MessageListWrapper,
  UnreadButton,
} from './styles';
import { layoutSelect } from '../../../layout/context';
import ChatListPage from './page/component';
import { defineMessages, useIntl } from 'react-intl';
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import { Message } from '/imports/ui/Types/message';
import ChatPopupContainer from '../chat-popup/component';
import { ChatEvents } from '/imports/ui/core/enums/chat';
import { Layout } from '../../../layout/layoutTypes';

// @ts-ignore - temporary, while meteor exists in the project
const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

const PAGE_SIZE = 50;

const intlMessages = defineMessages({
  loadMoreButtonLabel: {
    id: 'app.chat.loadMoreButtonLabel',
    description: 'Label for load more button',
  },
  moreMessages: {
    id: 'app.chat.moreMessages',
    description: 'Chat message when the user has unread messages below the scroll',
  },
});

interface ChatListProps {

  totalUnread: number;
  totalPages: number;
  chatId: string;
  setMessageAsSeenMutation: (
    data: {
      variables: {
        chatId: string,
        lastSeenAt: number,
      },
    }
  ) => void;
  lastSeenAt: number;
}
const isElement = (el: any): el is HTMLElement => {
  return el instanceof HTMLElement;
}

const isMap = (map: any): map is Map<number, string> => {
  return map instanceof Map;
}
let elHeight = 0;

const scrollObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const el = entry.target;
    if (isElement(el) && isElement(el.parentElement)) {
      if (el.offsetHeight > elHeight) {
        elHeight = el.offsetHeight;
        el.parentElement.scrollTop = el.parentElement.scrollHeight + el.parentElement.clientHeight;
      } else {
        elHeight = 0;
      }
    }
  }
});

const setLastSender = (lastSenderPerPage: Map<number, string>) => {

  return (page: number, sender: string) => {
    if (isMap(lastSenderPerPage)) {
      lastSenderPerPage.set(page, sender);
    }
  }
}

const lastSeenQueue = makeVar<{ [key: string]: Set<number> }>({});
const setter = makeVar<{ [key: string]: Function }>({});
const lastSeenAtVar = makeVar<{ [key: string]: number }>({});
const chatIdVar = makeVar<string>('');

const dispatchLastSeen = () => setTimeout(() => {
  const lastSeenQueueValue = lastSeenQueue();
  if (lastSeenQueueValue[chatIdVar()]) {
    const lastTimeQueue = Array.from(lastSeenQueueValue[chatIdVar()])
    const lastSeenTime = Math.max(...lastTimeQueue);
    const lastSeenAtVarValue = lastSeenAtVar();
    if (lastSeenTime > (lastSeenAtVarValue[chatIdVar()] ?? 0)) {
      lastSeenAtVar({ ...lastSeenAtVar(), [chatIdVar()]: lastSeenTime });
      setter()[chatIdVar()](lastSeenTime);
    }
  }
}, 500);

const ChatMessageList: React.FC<ChatListProps> = ({
  totalPages,
  chatId,
  setMessageAsSeenMutation,
  lastSeenAt,
  totalUnread,
}) => {
  const intl = useIntl();
  const messageListRef = React.useRef<HTMLDivElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  // I used a ref here because I don't want to re-render the component when the last sender changes
  const lastSenderPerPage = React.useRef<Map<number, string>>(new Map());
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const [userLoadedBackUntilPage, setUserLoadedBackUntilPage] = useState<number | null>(null);
  const [lastMessageCreatedTime, setLastMessageCreatedTime] = useState<number>(0);
  const [followingTail, setFollowingTail] = React.useState(true);

  useEffect(() => {
    setter({
      ...setter(),
      [chatId]: setLastMessageCreatedTime,
    });
    chatIdVar(chatId);
    setLastMessageCreatedTime(0);
  }, [chatId]);
  useEffect(() => {
    setMessageAsSeenMutation({
      variables: {
        chatId: chatId,
        lastSeenAt: lastMessageCreatedTime,
      },
    });
  }, [lastMessageCreatedTime]);

  const markMessageAsSeen = useCallback((message: Message) => {
    if (message.createdTime > (lastMessageCreatedTime ?? 0)) {
      dispatchLastSeen();
      const lastSeenQueueValue = lastSeenQueue();
      if (lastSeenQueueValue[chatId]) {
        lastSeenQueueValue[chatId].add(message.createdTime);
        lastSeenQueue(lastSeenQueueValue)
      } else {
        lastSeenQueueValue[chatId] = new Set([message.createdTime]);
        lastSeenQueue(lastSeenQueueValue)
      }
    }
  }, [lastMessageCreatedTime, chatId]);

  const setScrollToTailEventHandler = (el: HTMLDivElement) => {
    if (Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) === 0) {
      if (isElement(contentRef.current)) {
        toggleFollowingTail(true)
      }
    } else {
      if (isElement(contentRef.current)) {
        toggleFollowingTail(false)
      }
    }
  };

  const toggleFollowingTail = (toggle: boolean) => {
    setFollowingTail(toggle);
    if (toggle) {
      if (isElement(contentRef.current)) {
        scrollObserver.observe(contentRef.current as HTMLDivElement);
        setFollowingTail(true);
      }
    } else {
      if (isElement(contentRef.current)) {
        if (userLoadedBackUntilPage === null) {
          setUserLoadedBackUntilPage(Math.max(totalPages - 2, 0));
        }
        scrollObserver.unobserve(contentRef.current as HTMLDivElement);
        setFollowingTail(false);
      }
    }
  };

  const renderUnreadNotification = useMemo(() => {
    if (totalUnread && !followingTail) {
      return (
        <UnreadButton
          aria-hidden="true"
          color="primary"
          size="sm"
          key="unread-messages"
          label={intl.formatMessage(intlMessages.moreMessages)}
          onClick={() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
          }}
        />
      );
    }
    return null;
  }, [totalUnread, followingTail]);

  useEffect(() => {
    const scrollToTailEventHandler = () => {
      if (scrollObserver && contentRef.current) {
        scrollObserver.observe(contentRef.current as HTMLDivElement);
        if (isElement(messageListRef.current)) {
          messageListRef.current.scrollTop = messageListRef.current.scrollHeight + messageListRef.current.clientHeight;
        }
        setFollowingTail(true);
      }
    };

    window.addEventListener(ChatEvents.SENT_MESSAGE, scrollToTailEventHandler);

    return () => {
      window.removeEventListener(ChatEvents.SENT_MESSAGE, scrollToTailEventHandler);
    };
  }, [contentRef.current]);

  useEffect(() => {
    if (followingTail) {
      setUserLoadedBackUntilPage(null);
    }
  }, [followingTail]);

  useEffect(() => {
    if (isElement(contentRef.current)) {
      toggleFollowingTail(true);
    }

    if (isElement(messageListRef.current)) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }

    return () => {
      toggleFollowingTail(false);
    }
  }, [contentRef]);

  const firstPageToLoad = userLoadedBackUntilPage !== null
    ? userLoadedBackUntilPage : Math.max(totalPages - 2, 0);
  const pagesToLoad = (totalPages - firstPageToLoad) || 1;
  return (
    <>
      {
        [
          <MessageListWrapper>
            <MessageList
              ref={messageListRef}
              onWheel={(e) => {
                if (e.deltaY < 0) {
                  if (isElement(contentRef.current) && followingTail) {
                    toggleFollowingTail(false)
                  }
                } else if (e.deltaY > 0) {
                  setScrollToTailEventHandler(messageListRef.current as HTMLDivElement);
                }
              }}
              onMouseUp={() => {
                setScrollToTailEventHandler(messageListRef.current as HTMLDivElement);
              }}
              onTouchEnd={() => {
                setScrollToTailEventHandler(messageListRef.current as HTMLDivElement);
              }}
            >
              <span>
                {
                  (userLoadedBackUntilPage)
                    ? (
                      <ButtonLoadMore
                        onClick={() => {
                          if (followingTail) {
                            toggleFollowingTail(false);
                          }
                          setUserLoadedBackUntilPage(userLoadedBackUntilPage - 1);
                        }}
                      >
                        {intl.formatMessage(intlMessages.loadMoreButtonLabel)}
                      </ButtonLoadMore>
                    ) : null
                }
              </span>
              <div id="contentRef" ref={contentRef}>
                <ChatPopupContainer />
                {
                  // @ts-ignore
                  Array.from({ length: pagesToLoad }, (v, k) => k + (firstPageToLoad)).map((page) => {
                    return (
                      <ChatListPage
                        key={`page-${page}`}
                        page={page}
                        pageSize={PAGE_SIZE}
                        setLastSender={()=> setLastSender(lastSenderPerPage.current)}
                        lastSenderPreviousPage={page ? lastSenderPerPage.current.get(page - 1) : undefined}
                        chatId={chatId}
                        markMessageAsSeen={markMessageAsSeen}
                        scrollRef={messageListRef}
                        lastSeenAt={lastSeenAt}
                      />
                    )
                  })
                }
              </div>
              <div ref={messagesEndRef} />
            </MessageList>
          </MessageListWrapper>,
          renderUnreadNotification,
        ]
      }
    </>
  );
};

const ChatMessageListContainer: React.FC = () => {
  const idChatOpen = layoutSelect((i: Layout) => i.idChatOpen);
  const isPublicChat = idChatOpen === PUBLIC_CHAT_KEY;
  const chatId = !isPublicChat ? idChatOpen : PUBLIC_GROUP_CHAT_KEY;
  const currentChat = useChat((chat) => {
    return {
      chatId: chat.chatId,
      totalMessages: chat.totalMessages,
      totalUnread: chat.totalUnread,
      lastSeenAt: chat.lastSeenAt,
    }
  }, chatId) as Partial<Chat>;

  const [setMessageAsSeenMutation] = useMutation(LAST_SEEN_MUTATION);

  const totalMessages = currentChat?.totalMessages || 0;
  const totalPages = Math.ceil(totalMessages / PAGE_SIZE);
  return (
    <ChatMessageList
      lastSeenAt={currentChat?.lastSeenAt || 0}
      totalPages={totalPages}
      chatId={chatId}
      setMessageAsSeenMutation={setMessageAsSeenMutation}
      totalUnread={currentChat?.totalUnread || 0}
    />
  );
};

export default ChatMessageListContainer;
