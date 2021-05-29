import React, { useContext } from 'react';
import TimeWindowChatItem from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import ChatService from '../../service';
import { NLayoutContext } from '../../../layout/context/context';
import Auth from '/imports/ui/services/auth';

const CHAT_CONFIG = Meteor.settings.public.chat;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const extractPollQuestion = (pollText) => {
  if (!pollText) return {};

  const pollQuestion = pollText.split('<br/>')[0];
  const newPollText = pollText.replace(`${pollQuestion}<br/>`, '');

  return { pollQuestion, newPollText };
};

const isDefaultPoll = (pollText) => {
  const { newPollText } = extractPollQuestion(pollText);

  const pollValue = newPollText.replace(/<br\/>|[ :|%\n\d+]/g, '');
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
  const { users } = usingUsersContext;
  const {
    sender,
    key,
    timestamp,
    content,
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
        isDefaultPoll,
        extractPollQuestion,
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
