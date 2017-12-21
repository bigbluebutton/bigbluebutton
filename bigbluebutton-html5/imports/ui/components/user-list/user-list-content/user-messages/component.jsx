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
  isPublicChat: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
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
  constructor() {
    super();

    this.state = {
      index: -1,
    };

    this.openChatRefs = [];
    this.selectedIndex = -1;

    this.focusOpenChatItem = this.focusOpenChatItem.bind(this);
    this.changeState = this.changeState.bind(this);
  }

  componentDidMount() {
    if (!this.props.compact) {
      this._msgsList.addEventListener(
        'keydown',
        event => this.props.roving(
          event,
          this.props.openChats.length,
          this.changeState,
        ),
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.index === -1) {
      return;
    }

    if (this.state.index !== prevState.index) {
      this.focusOpenChatItem(this.state.index);
    }
  }

  getOpenChats() {
    const {
      openChats,
      openChat,
      compact,
      isPublicChat,
    } = this.props;

    let index = -1;

    return openChats.map(chat => (
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
        <div ref={(node) => { this.openChatRefs[index += 1] = node; }}>
          <ChatListItem
            isPublicChat={isPublicChat}
            compact={compact}
            openChat={openChat}
            chat={chat}
            tabIndex={-1}
          />
        </div>
      </CSSTransition>
    ));
  }

  changeState(newIndex) {
    this.setState({ index: newIndex });
  }

  focusOpenChatItem(index) {
    if (!this.openChatRefs[index]) {
      return;
    }

    this.openChatRefs[index].firstChild.focus();
  }

  render() {
    const {
      intl,
      compact,
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
          <div className={styles.list}>
            <TransitionGroup ref={(ref) => { this._msgItems = ref; }} >
              { this.getOpenChats() }
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
