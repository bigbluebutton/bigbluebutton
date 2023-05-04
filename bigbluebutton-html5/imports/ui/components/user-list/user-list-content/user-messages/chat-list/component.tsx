import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useSubscription } from '@apollo/client';
import Styled from './styles';
import { defineMessages, useIntl } from 'react-intl';
import {
    CHATS_SUBSCRIPTION
} from './queries';
import ChatListItem from './chat-list-item/component'
import { Chat } from './chat-list-item/chatTypes';

const intlMessages = defineMessages({
    messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
    },
});

const ChatList: React.FC = () => {
    const { data } = useSubscription(CHATS_SUBSCRIPTION);

    const getActiveChats = () => {
        if (data) {
            const { chat: chats } = data;

            return chats.map( (chat: Chat) => (
                <CSSTransition
                  classNames={"transition"}
                  appear
                  enter
                  exit={false}
                  timeout={0}
                  component="div"
                  key={chat.chatId}
                >
                  <Styled.ListTransition >
                    <ChatListItem
                      chat={chat}
                    />
                  </Styled.ListTransition>
                </CSSTransition>
              ));
        } else {
            return null;
        }
    }
    const intl = useIntl();
    return (
    <Styled.Messages>
        <Styled.Container>
            <Styled.MessagesTitle data-test="messageTitle">
                {intl.formatMessage(intlMessages.messagesTitle)}
            </Styled.MessagesTitle>
        </Styled.Container>
        <Styled.ScrollableList
        role="tabpanel"
        tabIndex={-1}
        >
        <Styled.List>
            <TransitionGroup >
                {getActiveChats()}
            </TransitionGroup>
        </Styled.List>
        </Styled.ScrollableList>
    </Styled.Messages>)
};

export default ChatList;

