import React, { useContext } from 'react';
import TimeWindowChatItem from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import ChatLogger from '/imports/ui/components/chat/chat-logger/ChatLogger';
import ChatService from '../../service';
import { NLayoutContext } from '../../../layout/context/context';

const CHAT_CONFIG = Meteor.settings.public.chat;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const isDefaultPoll = (pollText) => {
  const pollValue = pollText.replace(/<br\/>|[ :|%\n\d+]/g, '');
  switch (pollValue) {
    case 'A': case 'AB': case 'ABC': case 'ABCD':
    case 'ABCDE': case 'YesNo': case 'TrueFalse':
      return true;
    default:
      return false;
  }
};

const TimeWindowChatItemContainer = (props) => {
  const { message, messageId } = props;
  const newLayoutContext = useContext(NLayoutContext);
  const { newLayoutContextState } = newLayoutContext;
  const { idChatOpen } = newLayoutContextState;
  const usingUsersContext = useContext(UsersContext);
  const  { users } = usingUsersContext;
  const {
    sender,
    key,
    timestamp,
    content,
    color,
  } = message;

  const messages = content;
  const user = users[sender?.id];
  const messageKey = key;
  const handleReadMessage = timestamp => ChatService.updateUnreadMessage(timestamp, idChatOpen);
  return (
    <TimeWindowChatItem
      {
      ...{
        color: user?.color || color,
        isModerator: user?.role === ROLE_MODERATOR,
        isOnline: !!user,
        avatar: user?.avatar,
        name: user?.name || sender?.name,
        read: message.read,
        messages,
        isDefaultPoll,
        user,
        timestamp,
        systemMessage: messageId.startsWith(SYSTEM_CHAT_TYPE) || !sender,
        messageKey,
        handleReadMessage,
        ...props,
      }
      }
    />
  );
}

export default TimeWindowChatItemContainer;
