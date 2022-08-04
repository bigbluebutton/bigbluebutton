import React, { useContext } from 'react';
import TimeWindowChatItem from './component';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import ChatService from '../../service';
import { layoutSelect } from '../../../layout/context';
import PollService from '/imports/ui/components/poll/service';
import QuestionQuizService from '/imports/ui/components/question-quiz/service';
import Auth from '/imports/ui/services/auth';

const CHAT_CONFIG = Meteor.settings.public.chat;
const SYSTEM_CHAT_TYPE = CHAT_CONFIG.type_system;
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

const TimeWindowChatItemContainer = (props) => {
  const { message, messageId } = props;

  const idChatOpen = layoutSelect((i) => i.idChatOpen);
  const usingUsersContext = useContext(UsersContext);
  const { users } = usingUsersContext;
  const usernames = {};
  const amIPresenter = users[Auth.meetingID][Auth.userID].presenter;
  Object.values(users[Auth.meetingID]).forEach((user) => {
    if(!user.presenter)
    usernames[user.userId] = { userId: user.userId, name: user.name };
  });
  const {
    sender,
    senderName,
    senderRole,
    key,
    timestamp,
    content,
    extra,
    messageValues,
  } = message;
  const messages = content;

  const user = (sender === 'SYSTEM') ? {
    name: senderName,
    color: '#01579b',
    avatar: '',
    role: ROLE_MODERATOR,
    loggedOut: false,
  } : users[Auth.meetingID][sender];
  const messageKey = key;
  const handleReadMessage = (tstamp) => ChatService.updateUnreadMessage(tstamp, idChatOpen);
  return (
    <TimeWindowChatItem
      {
      ...{
        color: user?.color,
        messageFromModerator: senderRole === ROLE_MODERATOR,
        isSystemSender: sender === 'SYSTEM',
        isOnline: !user?.loggedOut,
        avatar: user?.avatar,
        name: user?.name,
        read: message.read,
        messages,
        extra,
        messageValues,
        getPollResultString: PollService.getPollResultString,
        getQuestionQuizResultString: QuestionQuizService.getQuestionQuizResultString,
        user,
        timestamp,
        systemMessage: messageId.startsWith(SYSTEM_CHAT_TYPE) || !sender,
        messageKey,
        handleReadMessage,
        usernames,
        amIPresenter,
        getExportedPresentationString: ChatService.getExportedPresentationString,
        ...props,
      }
      }
    />
  );
};

export default TimeWindowChatItemContainer;
