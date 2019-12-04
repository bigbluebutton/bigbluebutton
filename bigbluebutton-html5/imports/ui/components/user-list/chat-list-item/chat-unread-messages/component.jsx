import React from 'react';
import PropTypes from 'prop-types';
import { defineMessages, injectIntl } from 'react-intl';
import { styles } from './styles';

const intlMessages = defineMessages({
  unreadPlural: {
    id: 'app.userList.chatListItem.unreadPlural',
    description: 'singular aria label for new message',
  },
  unreadSingular: {
    id: 'app.userList.chatListItem.unreadSingular',
    description: 'plural aria label for new messages',
  },
});

const propTypes = {
  counter: PropTypes.number.isRequired,
  intl: PropTypes.shape({ formatMessage: PropTypes.func.isRequired }).isRequired,
};

const defaultProps = {
};

const ChatUnreadCounter = props => (
  <div
    className={styles.unreadMessages}
    aria-label={props.counter > 0
      ? props.intl.formatMessage(intlMessages.unreadSingular, { 0: props.counter })
      : props.intl.formatMessage(intlMessages.unreadPlural, { 0: props.counter })}
  >
    <div className={styles.unreadMessagesText} aria-hidden="true">
      {props.counter}
    </div>
  </div>
);

ChatUnreadCounter.propTypes = propTypes;
ChatUnreadCounter.defaultProps = defaultProps;

export default injectIntl(ChatUnreadCounter);
