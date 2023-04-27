import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSubscription } from "@apollo/client";
import {
  CHAT_MESSAGE_SUBSCRIPTION,
  CHAT_SUBSCRIPTION,
  ChatMessageSubscriptionResponse,
  ChatSubscriptionResponse,
} from "../queries";
import { AutoSizer,CellMeasurer, CellMeasurerCache } from 'react-virtualized';
import { layoutSelect } from '/imports/ui/components/layout/context';
import { Chat } from '/imports/ui/Types/chat';
import { Message } from "/imports/ui/Types/message";
import { MessageList, MessageListWrapper } from "./styles";
import ChatListItem from "./list-item/component";
import { layoutSelectOutput } from "/imports/ui/components/layout/context";
import { debounce } from "radash";
import List, { ListRowRenderer, ListRowProps } from 'react-virtualized/dist/es/List';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;
const PUBLIC_GROUP_CHAT_KEY = CHAT_CONFIG.public_group_id;

interface ChatlistProps{
  messages: Array<Message> | [];
  totalMessages: number;
  sidebarWidth: number;
  setLimit: (limit: number) => void;
  setOffset: (offset: number) => void;
  offset: number;
}

const keyMapperFunctionHolder = {
  keyMapper: (index:number) => ''
}

const cache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 18,
  keyMapper: function (index:number) {
    if(keyMapperFunctionHolder.keyMapper) {
      const key = keyMapperFunctionHolder.keyMapper(index);
      return key;
    }
  }
});

const rowRenderer = (messages: Array<Message>, offset: number, totalMessages:number, listRef:Ref<List>, { index, key, parent, style }: ListRowProps) => {
  const resultsArrayIndex = totalMessages - offset - index - 1;
  const message = messages[resultsArrayIndex];

  const previousMessage = messages[resultsArrayIndex + 1];

  return (
    <CellMeasurer
        cache={cache}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
        key={`cm-${index}-${message?.messageId}`}
      >
        <span
          style={style}
          key={`span-${index}-${message?.messageId}`}
          role="listitem"
          data-test="msgListItem"
        >
          <ChatListItem
            message={message}
            index={index}
            previousMessage={previousMessage}
            listRef={listRef}
            cacheClearFn={cache.clear.bind(cache)}
          />
        </span>
      </CellMeasurer>
  );
}

const ChatList: React.FC<ChatlistProps> = ({
  messages,
  totalMessages,
  sidebarWidth,
  setOffset,
  setLimit,
  offset,
}) => {
  const [lastWindowWidth, setLastWindowWidth] = React.useState(0);

  useEffect(() => {
    if (lastWindowWidth !== sidebarWidth) {
      cache.clearAll();
      setLastWindowWidth(sidebarWidth);
    }
  },[lastWindowWidth, sidebarWidth]);

  useEffect(
    () => {
      keyMapperFunctionHolder.keyMapper = (index:number) => {
        
        const resultsArrayIndex = totalMessages - offset - index - 1;
        const message = messages[resultsArrayIndex];
        const previousMessage = messages[resultsArrayIndex+1];
        return `${message?.messageId}::${previousMessage?.messageId}`;
      }


    }, [messages]
  );

  const listRef = useRef<List>();

  const [scrollToBottom, setScrollToBottom] = useState(true);

  const setSubscriptionVariables = debounce({delay: 500}, ({ startIndex, stopIndex, overscanStartIndex, overscanStopIndex }) => {
    if(scrollToBottom) {
      setOffset(0);
      setLimit(50);
    } else {
      const newOffset = totalMessages - overscanStopIndex - 1;
      setOffset(newOffset);
      
      const limit = (overscanStopIndex - overscanStartIndex) + 1;
      setLimit(limit < 50 ? 50 : limit);
    }
  });

  return (
    <MessageListWrapper>
      <AutoSizer>
        {({ height, width }) => {         
          return <MessageList
            ref={listRef}
            // isScrolling
            rowHeight={cache.rowHeight}
            estimatedRowSize={100}
            rowRenderer={rowRenderer.bind(null, messages, offset, totalMessages, listRef)}
            rowCount={totalMessages}
            height={height - 1}
            width={width - 1}
            overscanRowCount={10}
            onRowsRendered={({ startIndex, stopIndex, overscanStartIndex, overscanStopIndex }) => {
              const newScrollToBottom = totalMessages - stopIndex < 10;
              if( scrollToBottom !== newScrollToBottom && listRef.current?.Grid.state.scrollPositionChangeReason==='observed' ) {
                setScrollToBottom(newScrollToBottom);
              }
              setSubscriptionVariables({ startIndex, stopIndex, overscanStartIndex, overscanStopIndex });
            }}
            // scrollToRow={totalMessages - 1}
            scrollToIndex={scrollToBottom?totalMessages - 1:undefined}
            // scrollToAlignment={scrollToBottom ? "end" : undefined}
          // scrollToIndex={shouldAutoScroll ? scrollPosition : undefined}
          // onRowsRendered={({ stopIndex }) => {
          //   this.handleScrollUpdate(stopIndex);
          // }}
          // onScroll={({ clientHeight, scrollHeight, scrollTop }) => {
          //   const scrollSize = scrollTop + clientHeight;
          //   if (scrollSize >= scrollHeight) {
          //     this.setState({
          //       userScrolledBack: false,
          //     });
          //   }
          // }}
          />

        }

        }
      </AutoSizer>
    </MessageListWrapper>
  );

  ;
};

const ChatContainer = () => {
  const idChatOpen = layoutSelect((i) => i.idChatOpen);
  const isPublicChat = idChatOpen === PUBLIC_CHAT_KEY;
  const chatId = !isPublicChat ? idChatOpen : PUBLIC_GROUP_CHAT_KEY;
  const [limit, setLimit] = React.useState(50);
  const [offset, setOffset] = React.useState(0);
  let emptyMessagesArray : Array<Message> = []
  const [old, setOld] = React.useState({
    messages: emptyMessagesArray,
    limit: 50,
    offset: 0,
    totalMessages: 0
  });
  
  // Chat information
  const {
    data: chatData,
    loading: chatLoading,
  } = useSubscription<ChatSubscriptionResponse>(CHAT_SUBSCRIPTION);
  
  const currentChat = chatData?.chat?.filter((chat) => chat?.chatId === chatId)?.[0];
  const totalMessages = currentChat?.totalMessages || 0;
  const sidebarContentOutput = layoutSelectOutput((i) => i.sidebarContent);

  // Chat messages
  const {
    data: messagesData,
    loading: messagesLoading,
  } = useSubscription<ChatMessageSubscriptionResponse>(CHAT_MESSAGE_SUBSCRIPTION, {
    variables: {
      offset,
      limit,
    }
  });
  const messages = (messagesData?.chat_message_public||[]);

  const expectedRows = Math.min(totalMessages - offset, limit);
  const avaliableRows = messages.length;
  const useOld = messagesLoading || expectedRows !== avaliableRows

  useEffect(()=>{
    if(!useOld) {
      setOld({...old, totalMessages, messages: (JSON.parse(JSON.stringify(messages)) as Array<Message>), offset});
    }
  }, [useOld, totalMessages, messages.length])

  return <ChatList
      totalMessages={useOld ? old.totalMessages : totalMessages}
      offset={useOld ? old.offset : offset}
      messages={useOld ? old.messages : messages}
      sidebarWidth={sidebarContentOutput?.width || 0}
      setLimit={setLimit}
      setOffset={setOffset}
    />;
};

export default ChatContainer;

