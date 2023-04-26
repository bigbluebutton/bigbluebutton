import React, { useEffect } from "react";
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
import { ListRowRenderer, ListRowProps } from 'react-virtualized/dist/es/List';

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

const cache = new CellMeasurerCache({
  fixedWidth: true,
  minHeight: 18,
});

const rowRender = (messages: Array<Message>, offset: number, totalMessages:number ,{ index, key, parent, style }: ListRowProps) => {
  const message = messages[index - (offset+totalMessages)];
  const previousMessage = messages[(index - offset) - 1];
  return (
    <CellMeasurer
        key={key}
        cache={cache}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
      >
        <span
          style={style}
          key={`span-${key}-${index}`}
          role="listitem"
          data-test="msgListItem"
        >
          <ChatListItem
            message={message}
            previousMessage={previousMessage}
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
  },[sidebarWidth]);

  useEffect(() => {
    cache.keyMapper = (index) => {
      const message = messages[index];
      return message?.messageId;
    }
  }, [messages]);

  return (
    <MessageListWrapper>
      <AutoSizer>
        {({ height, width }) => {         
          return <MessageList
            // isScrolling
            rowHeight={cache.rowHeight}
            rowRenderer={rowRender.bind(null, messages, offset, totalMessages)}
            rowCount={totalMessages}
            height={height - 1}
            width={width - 1}
            overscanRowCount={10}
            onRowsRendered={debounce({delay: 500}, ({ startIndex, stopIndex, overscanStartIndex, overscanStopIndex }) => {
              setOffset(totalMessages - overscanStopIndex);
              console.log('overscanStartIndex', overscanStartIndex);
              console.log('overscanStopIndex', overscanStopIndex);
              console.log('totalMessages', totalMessages);
              console.log('totalMessages - overscanStopIndex', totalMessages - overscanStopIndex);
              const limit = (overscanStopIndex - overscanStartIndex) + 1;
              setLimit(limit < 50 ? 50 : limit);
            })}
            deferredMeasurementCache={cache}
            // scrollToIndex={totalMessages - 1}
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
  const [limit, setLimit] = React.useState(5);
  const [offset, setOffset] = React.useState(0);
  const {
    data: messagesData,
    loading: messagesLoading,
  } = useSubscription<ChatMessageSubscriptionResponse>(CHAT_MESSAGE_SUBSCRIPTION, {
    variables: {
      offset: offset,
      limit:limit,
    }
  });
  // We show the chat list from the bottom to the top so we orderby it in descending order and reverse it
  const messages = messagesData?.chat_message_public?.toReversed();
  const {
    data: chatData,
    loading: chatLoading,
  } = useSubscription<ChatSubscriptionResponse>(CHAT_SUBSCRIPTION);

  const currentChat = chatData?.chat?.filter((chat) => chat?.chatId === chatId)?.[0];
  const totalMessages = currentChat?.totalMessages || 0;
  const sidebarContentOutput = layoutSelectOutput((i) => i.sidebarContent);

  return <ChatList
      messages={messages || []}
      totalMessages={totalMessages}
      sidebarWidth={sidebarContentOutput?.width || 0}
      setLimit={setLimit}
      setOffset={setOffset}
      offset={offset}
    />;
};

export default ChatContainer;

