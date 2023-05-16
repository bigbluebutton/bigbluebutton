import React, { useEffect } from "react";
import { Meteor } from "meteor/meteor";
import { useSubscription } from "@apollo/client";
import { CHAT_SUBSCRIPTION, ChatSubscriptionResponse } from "./queries";
import {
  ButtonLoadMore,
  MessageList,
  MessageListWrapper,
} from "./styles";
import { layoutSelect } from "../../../layout/context";
import ChatListPage from "./page/component";
import { defineMessages, useIntl } from "react-intl";

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
}
const isElement = (el: any): el is HTMLElement => {
  return el instanceof HTMLElement;
}

const isMap = (map: any): map is Map<number, string> => {
  return map instanceof Map;
}

const scrollObserver = new ResizeObserver((entries)=>{
  for (const entry of entries) {
    const el = entry.target;
    if (isElement(el) && isElement(el.parentElement){
      el.parentElement.scrollTop = el.parentElement.scrollHeight;
    }
  }
});

const setLastSender = (lastSenderPerPage: Map<number, string>,) =>{
  
  return (page: number, sender: string) => {
    if (isMap(lastSenderPerPage)) {
      lastSenderPerPage.set(page, sender);
    }
  }
}

const ChatList: React.FC<ChatListProps> = ({ totalPages }) => {
  const intl = useIntl();
  const messageListRef = React.useRef<HTMLDivElement>();
  const contentRef = React.useRef<HTMLDivElement>();
  // I used a ref here because I don't want to re-render the component when the last sender changes
  const lastSenderPerPage = React.useRef<Map<number, string>>(new Map());

  const [userLoadedBackUntilPage, setUserLoadedBackUntilPage] = React.useState<number | null>(null);
  const [followingTail, setFollowingTail] = React.useState(true);

  const toggleFollowingTail = (toggle: boolean) => {
    setFollowingTail(toggle);
    if (toggle) {
      if (isElement(contentRef.current)) {
        scrollObserver.observe(contentRef.current as HTMLDivElement);
      }
    } else {
      if (isElement(contentRef.current)) {
        if (userLoadedBackUntilPage === null) {
          setUserLoadedBackUntilPage(totalPages-2);
        }
        scrollObserver.unobserve(contentRef.current as HTMLDivElement);
      }
    }
  }

  useEffect(() => {
    if (followingTail){
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

    return ()=>{
      toggleFollowingTail(false);
    }
  }, [contentRef]);

  const totalLoadPages = userLoadedBackUntilPage !== null
    ? userLoadedBackUntilPage : Math.max(totalPages-2, 0);
  const pagesToLoad = (totalPages-totalLoadPages) || 1;

  return (
    <MessageListWrapper>
      <MessageList
        ref={messageListRef}
        onWheel={(e)=>{
          const el = messageListRef.current as HTMLDivElement;
          if (e.deltaY < 0 && el.scrollTop) {
            if (isElement(contentRef.current)) {
              toggleFollowingTail(false)
            }
          } else if (e.deltaY > 0) {
            if (Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop) === 0) {
              if (isElement(contentRef.current)) {
                toggleFollowingTail(true)
              }
            }
          }
        }}
        onMouseUp={(e)=>{
          const el = messageListRef.current as HTMLDivElement;

          if (Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop) === 0) {
            if (isElement(contentRef.current)) {
              toggleFollowingTail(true)
            }
          } else {
            if (isElement(contentRef.current)) {
              toggleFollowingTail(false)
            }
          }
        }
      >
        <span>
          {
            (userLoadedBackUntilPage) 
            ? (
              <ButtonLoadMore
            onClick={()=>{
              if (followingTail){
                toggleFollowingTail(false);
              }
              setUserLoadedBackUntilPage(userLoadedBackUntilPage-1);
              }
            }
          >
            {intl.formatMessage(intlMessages.loadMoreButtonLabel)}
          </ButtonLoadMore>
            ): null
          }
        </span>
        <div ref={contentRef}>
          {
            Array.from(Array(pagesToLoad).keys()).map((page) => {              
              return (
                <ChatListPage
                  key={`page-${totalLoadPages+page}`}
                  page={totalLoadPages+page}
                  pageSize={PAGE_SIZE}
                  setLastSender={setLastSender(lastSenderPerPage.current)}
                  // avoid the first page to have a lastSenderPreviousPage, because it doesn't exist
                  lastSenderPreviousPage={page ? lastSenderPerPage.current.get(totalLoadPages+page) : undefined}
                />
              )
            })
          }
        </div>
      </MessageList>
    </MessageListWrapper>
  );
}

const ChatListContainer: React.FC = ({}) => {
  const idChatOpen = layoutSelect((i) => i.idChatOpen);
  const isPublicChat = idChatOpen === PUBLIC_CHAT_KEY;
  const chatId = !isPublicChat ? idChatOpen : PUBLIC_GROUP_CHAT_KEY;
  const {
    data: chatData,
    loading: chatLoading,
    error: chatError,
  } = useSubscription<ChatSubscriptionResponse>(CHAT_SUBSCRIPTION);

  if (chatError) return <p>chatError: {chatError}</p>;
  const currentChat = chatData?.chat?.filter((chat) => chat?.chatId === chatId)?.[0];
  const totalMessages = currentChat?.totalMessages || 0;
  const totalPages = Math.ceil(totalMessages / PAGE_SIZE);
  return (
    <ChatList
      totalPages={totalPages}
    />
  );
}

export default ChatListContainer;