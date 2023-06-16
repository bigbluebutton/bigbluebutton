import React, { useCallback, useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useMutation } from "@apollo/client";
import { LAST_SEEN_MUTATION } from "./queries";
import {
  ButtonLoadMore,
  MessageList,
  MessageListWrapper,
} from "./styles";
import { layoutSelect } from "../../../layout/context";
import ChatListPage from "./page/component";
import { defineMessages, useIntl } from "react-intl";
import Events from "/imports/ui/core/events/events";
import useChat from "/imports/ui/core/hooks/useChat";
import { Chat } from "/imports/ui/Types/chat";
import { Message } from "/imports/ui/Types/message";
import { useCurrentUser } from "/imports/ui/core/hooks/useCurrentUser";
import { User } from "/imports/ui/Types/user";

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

const PAGE_SIZE = 50;

const intlMessages = defineMessages({
  loadMoreButtonLabel: {
    id: 'app.chat.loadMoreButtonLabel',
    description: 'Label for load more button',
  },
});

interface ChatListProps {
  totalPages: number;
  chatId: string;
  currentUserId: string;
  setMessageAsSeenMutation: Function;
  totalUnread: number;
}
const isElement = (el: any): el is HTMLElement => {
  return el instanceof HTMLElement;
}

const isMap = (map: any): map is Map<number, string> => {
  return map instanceof Map;
}

const scrollObserver = new ResizeObserver((entries) => {
  for (const entry of entries) {
    const el = entry.target;
    if (isElement(el) && isElement(el.parentElement){
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }
});

const setLastSender = (lastSenderPerPage: Map<number, string>,) => {

  return (page: number, sender: string) => {
    if (isMap(lastSenderPerPage)) {
      lastSenderPerPage.set(page, sender);
    }
  }
}

const ChatMessageList: React.FC<ChatListProps> = ({
  totalPages,
  chatId,
  currentUserId,
  setMessageAsSeenMutation,
  totalUnread,
}) => {
  const intl = useIntl();
  const messageListRef = React.useRef<HTMLDivElement>();
  const contentRef = React.useRef<HTMLDivElement>();
  // I used a ref here because I don't want to re-render the component when the last sender changes
  const lastSenderPerPage = React.useRef<Map<number, string>>(new Map());
  const [userLoadedBackUntilPage, setUserLoadedBackUntilPage] = React.useState<number | null>(null);
  const [followingTail, setFollowingTail] = React.useState(true);

  const markMessageAsSeen = useCallback((message: Message, page) => {
    if (
      (message.user.userId !== currentUserId)
      && (page + 1) === totalPages
      && totalUnread > 0
    ) {

      setMessageAsSeenMutation({
        variables: {
          chatId: message.chatId,
          lastSeenAt: message.createdTime,
        },
      })
    }
  }, [totalPages, currentUserId, totalUnread]);
  const toggleFollowingTail = (toggle: boolean) => {
    setFollowingTail(toggle);
    if (toggle) {
      if (isElement(contentRef.current)) {
        scrollObserver.observe(contentRef.current as HTMLDivElement);
      }
    } else {
      if (isElement(contentRef.current)) {
        if (userLoadedBackUntilPage === null) {
          setUserLoadedBackUntilPage(Math.max(totalPages - 2, 0));
        }
        scrollObserver.unobserve(contentRef.current as HTMLDivElement);
      }
    }
  }

  useEffect(() => {
    const setScrollToTailEventHandler = () => {
      if (scrollObserver && contentRef.current) {
        scrollObserver.observe(contentRef.current as HTMLDivElement);
        if (isElement(messageListRef.current)) {
          messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
        setFollowingTail(true);
      }

    };
    window.addEventListener(Events.SENT_MESSAGE, setScrollToTailEventHandler);

    return () => {
      window.removeEventListener(Events.SENT_MESSAGE, setScrollToTailEventHandler);
    }
  }, []);

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
    <MessageListWrapper>
      <MessageList
        ref={messageListRef}
        onScroll={(e) => {
          const el = messageListRef.current as HTMLDivElement;

          if (Math.abs(el.scrollHeight - el.clientHeight - el.scrollTop) === 0) {
            if (isElement(contentRef.current)) {
              toggleFollowingTail(true)
            }
          } else {
            if (isElement(contentRef.current)) {
              toggleFollowingTail(false)
            }
          }
        }
        }
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
                  }
                  }
                >
                  {intl.formatMessage(intlMessages.loadMoreButtonLabel)}
                </ButtonLoadMore>
              ) : null
          }
        </span>
        <div id="contentRef" ref={contentRef}>
          {
            Array.from({ length: pagesToLoad }, (v, k) => k + (firstPageToLoad)).map((page) => {
              return (
                <ChatListPage
                  key={`page-${page}`}
                  page={page}
                  pageSize={PAGE_SIZE}
                  setLastSender={setLastSender(lastSenderPerPage.current)}
                  // avoid the first page to have a lastSenderPreviousPage, because it doesn't exist
                  lastSenderPreviousPage={page ? lastSenderPerPage.current.get(page) : undefined}
                  chatId={chatId}
                  markMessageAsSeen={markMessageAsSeen}
                />
              )
            })
          }
        </div>
      </MessageList>
    </MessageListWrapper >
  );
}

const ChatMessageListContainer: React.FC = ({ }) => {
  const idChatOpen = layoutSelect((i) => i.idChatOpen);
  const isPublicChat = idChatOpen === PUBLIC_CHAT_KEY;
  const chatId = !isPublicChat ? idChatOpen : PUBLIC_GROUP_CHAT_KEY;
  const currentChat = useChat((chat) => {
    return {
      chatId: chat.chatId,
      totalMessages: chat.totalMessages,
      totalUnread: chat.totalUnread,
    }
  }, chatId) as Partial<Chat>;
  const currentUser = useCurrentUser((user: Partial<User>) => {
    return {
      userId: user.userId,
    }
  });
  const [setMessageAsSeenMutation] = useMutation(LAST_SEEN_MUTATION);

  const totalMessages = currentChat?.totalMessages || 0;
  const totalPages = Math.ceil(totalMessages / PAGE_SIZE);
  return (
    <ChatMessageList
      totalPages={totalPages}
      chatId={chatId}
      currentUserId={currentUser?.userId ?? ''}
      setMessageAsSeenMutation={setMessageAsSeenMutation}
      totalUnread={currentChat?.totalUnread || 0}
    />
  );
}

export default ChatMessageListContainer;