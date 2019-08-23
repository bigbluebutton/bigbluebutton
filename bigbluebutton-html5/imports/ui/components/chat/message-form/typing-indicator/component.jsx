import React, { PureComponent } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import browser from 'browser-detect';
import PropTypes from 'prop-types';
import { styles } from '../styles.scss';

const propTypes = {
  intl: intlShape.isRequired,
  currentChatPartner: PropTypes.string.isRequired,
  currentUserId: PropTypes.string.isRequired,
  typingUsers: PropTypes.arrayOf(Object).isRequired,
};

const messages = defineMessages({
  singularTyping: {
    id: 'app.chat.singularTyping',
    description: 'used to indicate when 1 user is typing',
  },
  pluralTyping: {
    id: 'app.chat.pluralTyping',
    description: 'used to indicate when multiple user are typing',
  },
  severalPeople: {
    id: 'app.chat.severalPeople',
    description: 'displayed when 4 or more users are typing',
  },
});


class TypingIndicator extends PureComponent {
  constructor(props) {
    super(props);

    this.BROWSER_RESULTS = browser();

    this.renderIsTypingString = this.renderIsTypingString.bind(this);
  }


  renderIsTypingString() {
    const {
      intl, typingUsers, currentUserId, currentChatPartner, indicatorEnabled,
    } = this.props;

    if (!indicatorEnabled) return null;

    let names = [];

    names = typingUsers.map((user) => {
      const { userId: typingUserId, isTypingTo, name } = user;
      let userNameTyping = null;
      userNameTyping = currentUserId !== typingUserId ? name : userNameTyping;
      const isPrivateMsg = currentChatPartner !== isTypingTo;
      if (isPrivateMsg) {
        const isMsgParticipant = typingUserId === currentChatPartner
          && currentUserId === isTypingTo;

        userNameTyping = isMsgParticipant ? name : null;
      }
      return userNameTyping;
    }).filter(e => e);

    if (names) {
      const { length } = names;
      const noTypers = length < 1;
      const singleTyper = length === 1;
      const multipleTypersShown = length > 1 && length <= 3;
      if (noTypers) return null;

      if (singleTyper) {
        if (names[0].length < 20) {
          return ` ${names[0]} ${intl.formatMessage(messages.singularTyping)}`;
        }
        return (` ${names[0].slice(0, 20)}... ${intl.formatMessage(messages.singularTyping)}`);
      }

      if (multipleTypersShown) {
        const formattedNames = names.map((name) => {
          if (name.length < 15) return ` ${name}`;
          return ` ${name.slice(0, 15)}...`;
        });
        return (`${formattedNames} ${intl.formatMessage(messages.pluralTyping)}`);
      }
      return (` ${intl.formatMessage(messages.severalPeople)} ${intl.formatMessage(messages.pluralTyping)}`);
    }

    return null;
  }

  render() {
    const {
      error,
    } = this.props;

    return (
      <div className={error ? styles.error : styles.info}>
        <span>
          <span>{error || this.renderIsTypingString()}</span>
          {!error && this.renderIsTypingString()
            ? <span className={styles.connectingAnimation} />
            : null
            }
        </span>
      </div>
    );
  }
}

TypingIndicator.propTypes = propTypes;

export default injectIntl(TypingIndicator);
