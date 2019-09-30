import React, { PureComponent } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import browser from 'browser-detect';
import PropTypes from 'prop-types';
import cx from 'classnames';
import _ from 'lodash';
import { styles } from '../styles.scss';

const propTypes = {
  intl: intlShape.isRequired,
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

    this.renderTypingElement = this.renderTypingElement.bind(this);
  }

  renderTypingElement() {
    const {
      typingUsers, indicatorEnabled, intl,
    } = this.props;

    if (!indicatorEnabled || !typingUsers) return null;

    const { length } = typingUsers;
    const isSingleTyper = length === 1;
    const isCoupleTyper = length === 2;
    const isMuiltiTypers = length > 2;

    let element = null;

    if (isSingleTyper) {
      const { name } = typingUsers[0];
      element = [
        (<span key="typing-name" className={styles.singleTyper}>
          {`${name}`}
&nbsp;
        </span>),
        (<span key="typing-singular">{`${intl.formatMessage(messages.singularTyping)}`}</span>),
      ];
    }

    if (isCoupleTyper) {
      element = typingUsers.map(user => <span key={_.uniqueId('typing-name-')} className={styles.coupleTyper}>{`${user.name}`}</span>);
      const comma = (
        <span key="typing-comma">
          {','}
&nbsp;
        </span>
      );
      element.splice(1, 0, comma);
      element.push(<span key="typing-plural">
        {`${intl.formatMessage(messages.pluralTyping)}`}
                   </span>);
    }

    if (isMuiltiTypers) {
      element = (
        <span>
          {`${intl.formatMessage(messages.severalPeople)} ${intl.formatMessage(messages.pluralTyping)}`}
        </span>
      );
    }

    return element;
  }

  render() {
    const {
      error,
    } = this.props;

    const style = {};
    style[styles.error] = !!error;
    style[styles.info] = !error;
    style[styles.spacer] = !!this.renderTypingElement();

    return (
      <div className={cx(style)}>
        <span className={styles.typingIndicator}>{error || this.renderTypingElement()}</span>
      </div>
    );
  }
}

TypingIndicator.propTypes = propTypes;

export default injectIntl(TypingIndicator);
