import React, { useContext } from 'react';
import TimeWindowChatItem from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import ChatService from '../../service';
import LayoutContext from '../../../layout/context';
import PollService from '/imports/ui/components/poll/service';
import Auth from '/imports/ui/services/auth';

const CHAT_CONFIG = Meteor.settings.public.chat;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const TimeWindowChatItemContainer = (props) => {
  const { message, messageId } = props;
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState } = layoutContext;
  const { idChatOpen } = layoutContextState;
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const {
    sender,
    key,
    timestamp,
    content,
    extra,
  } = message;
  const messages = content;
  const user = users[Auth.meetingID][sender];
  const messageKey = key;
  const handleReadMessage = (tstamp) => ChatService.updateUnreadMessage(tstamp, idChatOpen);
  return (
    <TimeWindowChatItem
      {
      ...{
        color: user?.color,
        isModerator: user?.role === ROLE_MODERATOR,
        isOnline: !user?.loggedOut,
        avatar: user?.avatar,
        name: user?.name,
        read: message.read,
        messages,
        extra,
        getPollResultString: PollService.getPollResultString,
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
};

export default TimeWindowChatItemContainer;
