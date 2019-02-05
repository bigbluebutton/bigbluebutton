import React, { PureComponent } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import cx from 'classnames';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import ChatListItem from '../../chat-list-item/component';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  activeChat: PropTypes.string,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isPublicChat: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  activeChat: '',
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

class UserMessages extends PureComponent {
  constructor() {
    super();

    this.state = {
      index: -1,
    };

    this.activeChatRefs = [];
    this.selectedIndex = -1;

    this.focusActiveChatItem = this.focusActiveChatItem.bind(this);
    this.changeState = this.changeState.bind(this);
  }

  componentDidMount() {
    const { compact, roving, activeChats } = this.props;
    if (!compact) {
      this._msgsList.addEventListener(
        'keydown',
        event => roving(
          event,
          activeChats.length,
          this.changeState,
        ),
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    const { index } = this.state;
    if (index === -1) {
      return;
    }

    if (index !== prevState.index) {
      this.focusActiveChatItem(index);
    }
  }

  getActiveChats() {
    const {
      activeChats,
      activeChat,
      compact,
      isPublicChat,
    } = this.props;

    let index = -1;

    return activeChats.map(chat => (
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
        <div ref={(node) => { this.activeChatRefs[index += 1] = node; }}>
          <ChatListItem
            isPublicChat={isPublicChat}
            compact={compact}
            activeChat={activeChat}
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

  focusActiveChatItem(index) {
    if (!this.activeChatRefs[index]) {
      return;
    }

    this.activeChatRefs[index].firstChild.focus();
  }

  render() {
    const {
      intl,
      compact,
    } = this.props;

    return (
      <div className={styles.messages}>
        {
          !compact ? (
            <h2 className={styles.smallTitle}>
              {intl.formatMessage(intlMessages.messagesTitle)}
            </h2>
          ) : (
            <hr className={styles.separator} />
          )
        }
        <div
          role="tabpanel"
          tabIndex={0}
          className={styles.scrollableList}
          ref={(ref) => { this._msgsList = ref; }}
        >
          <div className={styles.list}>
            <TransitionGroup ref={(ref) => { this._msgItems = ref; }}>
              {this.getActiveChats()}
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
