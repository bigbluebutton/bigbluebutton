import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import Styled from './styles';

const intlMessages = defineMessages({
  unreadPlural: {
    id: 'app.userList.chatListItem.unreadPlural',
    description: 'singular aria label for new message',
  },
  unreadSingular: {
    id: 'app.userList.chatListItem.unreadSingular',
    description: 'plural aria label for new messages',
  },
  publicChat: {
    id: 'app.chat.titlePublic',
    description: 'localized public chat name',
  },
});

const propTypes = {
  counter: PropTypes.number.isRequired,
  chat: PropTypes.shape({
    userId: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    unreadCounter: PropTypes.number.isRequired,
  }).isRequired,
  isPublicChat: PropTypes.func.isRequired,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
};

const defaultProps = {};

const ChatUnreadCounter = (props) => {
  const {
    counter,
    chat,
    isPublicChat,
    intl,
  } = props;

  const localizedChatName = isPublicChat(chat)
    ? intl.formatMessage(intlMessages.publicChat)
    : chat.name;

  const arialabel = `${localizedChatName} ${
    counter > 1
      ? intl.formatMessage(intlMessages.unreadPlural, { 0: counter })
      : intl.formatMessage(intlMessages.unreadSingular)}`;

  return (
    <Styled.UnreadMessages aria-label={arialabel}>
      <Styled.UnreadMessagesText aria-hidden="true">
        {counter}
      </Styled.UnreadMessagesText>
    </Styled.UnreadMessages>
  );
};

ChatUnreadCounter.propTypes = propTypes;
ChatUnreadCounter.defaultProps = defaultProps;

export default injectIntl(ChatUnreadCounter);
