import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import cx from 'classnames';
import styles from '/imports/ui/components/user-list/user-list-content/styles';
import ChatListItem from './../../chat-list-item/component';

const propTypes = {
  openChats: PropTypes.arrayOf(String).isRequired,
  openChat: PropTypes.string,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  rovingIndex: PropTypes.func.isRequired,
  isPublicChat: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  openChat: '',
};

const listTransition = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  appear: styles.appear,
  appearActive: styles.appearActive,
  leave: styles.leave,
  leaveActive: styles.leaveActive,
};

const intlMessages = defineMessages({
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },
});

class UserMessages extends Component {
  componentDidMount() {
    if (!this.props.compact) {
      this._msgsList.addEventListener(
        'keydown',
        event => this.props.rovingIndex(
          event,
          this._msgsList,
          this._msgItems,
          this.props.openChats.length,
        ),
      );
    }
  }

  render() {
    const {
      openChats,
      openChat,
      intl,
      compact,
      isPublicChat,
    } = this.props;

    return (
      <div className={styles.messages}>
        {
          !compact ?
            <div className={styles.smallTitle} role="banner">
              {intl.formatMessage(intlMessages.messagesTitle)}
            </div> : <hr className={styles.separator} />
        }
        <div
          role="tabpanel"
          tabIndex={0}
          className={styles.scrollableList}
          ref={(ref) => { this._msgsList = ref; }}
        >
          <div ref={(ref) => { this._msgItems = ref; }} className={styles.list}>
            <TransitionGroup>
              {openChats.map(chat => (
                <CSSTransition
                  classNames={listTransition}
                  appear
                  enter
                  exit={false}
                  timeout={0}
                  component="div"
                  className={cx(styles.chatsList)}
                  key={chat.id}
                >
                  <ChatListItem
                    isPublicChat={isPublicChat}
                    compact={compact}
                    openChat={openChat}
                    chat={chat}
                    tabIndex={-1}
                  />
                </CSSTransition>
              ))}
            </TransitionGroup>
          </div>
        </div>
      </div>
    );
  }
}

UserMessages.propTypes = propTypes;
UserMessages.defaultProps = defaultProps;

export default UserMessages;
