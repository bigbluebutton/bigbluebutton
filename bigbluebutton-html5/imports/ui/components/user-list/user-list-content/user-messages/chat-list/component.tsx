import React from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { useSubscription } from '@apollo/client';
import Styled from './styles';
import { defineMessages, useIntl } from 'react-intl';
import ChatListItem from './chat-list-item/component'
import useChat from '/imports/ui/core/hooks/useChat';
import { Chat } from '/imports/ui/Types/chat';
import usePendingChats from '/imports/ui/core/local-states/usePendingChats';
import { layoutDispatch } from '/imports/ui/components/layout/context';
import { ACTIONS, PANELS } from '/imports/ui/components/layout/enums';

const intlMessages = defineMessages({
    messagesTitle: {
        id: 'app.userList.messagesTitle',
        description: 'Title for the messages list',
    },
});

interface ChatListProps {
    chats: Partial<Chat>[],
}

const getActiveChats = (chats: Partial<Chat>[]) => {
    return chats.map((chat) => (
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
}

const ChatList: React.FC<ChatListProps> = ({ chats }) => {

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
                        {getActiveChats(chats) ?? null}
                    </TransitionGroup>
                </Styled.List>
            </Styled.ScrollableList>
        </Styled.Messages>)
};

const ChatListContainer: React.FC = () => {
    const chats: Partial<Chat>[] | null = useChat((chat) => { return chat; });
    const [pendingChats, setPendingChats] = usePendingChats();
    const layoutContextDispatch = layoutDispatch();
    if (!chats) return null;
    if (pendingChats.length > 0) {
        const notPendingAnymore = chats.filter((chat) => {
            if (chat.participant) {
                return pendingChats.includes(chat.participant.userId);
            }
            return false;
        }).map((chat) => {
            return {
                chatId: chat.chatId,
                participant: chat.participant?.userId,
            }
        });
        if (notPendingAnymore.length > 0) {
            const newPendingChats = pendingChats.filter((pendingChat) => {
                return !notPendingAnymore.some((chat) => chat.participant === pendingChat);
            });
            setPendingChats(newPendingChats);
            notPendingAnymore.forEach((chat) => {
                layoutContextDispatch({
                    type: ACTIONS.SET_ID_CHAT_OPEN,
                    value: chat.chatId,
                });
            });
        }
    }

    return (
        <ChatList chats={chats} />
    );
};

export default ChatListContainer;

