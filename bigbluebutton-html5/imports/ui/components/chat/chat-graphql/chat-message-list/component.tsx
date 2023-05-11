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

  const [userLoadedBackUntilPage, setUserLoadedBackUntilPage] = React.useState(-2);

  useEffect(() => {
    if (isElement(contentRef.current)) {
      scrollObserver.observe(contentRef.current as HTMLDivElement);
    }

    if (isElement(messageListRef.current)) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }

    return ()=>{
      scrollObserver.unobserve(contentRef.current as HTMLDivElement)
    }
  }, [contentRef]);

  useEffect(() => {
    // if userLoadedBackUntilPage is -2, then means user is following the tail.
    if (userLoadedBackUntilPage !== -2){
      setUserLoadedBackUntilPage(userLoadedBackUntilPage-1);
    }
  }, [totalPages]);

  return (
    <MessageListWrapper>
      <MessageList
        
        onWheel={(e)=>{
          if (e.deltaY < 0) {
            if (isElement(contentRef.current)) {
              scrollObserver.unobserve(contentRef.current)
            }
          } else if (e.deltaY > 0) {
            const el = contentRef.current as HTMLDivElement;
            if (Math.abs(el.scrollHeight-el.clientHeight-el.scrollTop) === 0) {
              if (isElement(contentRef.current)) {
                scrollObserver.observe(el)
              }
            }
          }
        }}
      >
        <span>
          {
            Math.abs(userLoadedBackUntilPage) < totalPages
            ? (
              <ButtonLoadMore
            onClick={()=>{
              setUserLoadedBackUntilPage(userLoadedBackUntilPage-1);
              scrollObserver.unobserve(contentRef.current as HTMLDivElement);
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
            Array.from(Array(totalPages).keys()).slice(userLoadedBackUntilPage).map((page) => {
              return (
                <ChatListPage
                  key={`page-${page}`}
                  page={page+1}
                  pageSize={PAGE_SIZE}
                  setLastSender={setLastSender(lastSenderPerPage.current)}
                  lastSenderPreviousPage={lastSenderPerPage.current.get(page)}
                />
              )
            })
          }
        </div>
      </MessageList>
    </MessageListWrapper>
  );
}
// totalPage = (totalMessages + PageSize - 1) / PageSize;
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