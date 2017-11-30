import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import cx from 'classnames';
import ReactDOM from 'react-dom';
import styles from './styles';
import ChatListItem from './../../chat-list-item/component';

const propTypes = {
  openChats: PropTypes.arrayOf(String).isRequired,
  openChat: PropTypes.string,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  rovingIndex: PropTypes.func.isRequired,
  resetIndex: PropTypes.func.isRequired,
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
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
  messagesTitle: {
    id: 'app.userList.messagesTitle',
    description: 'Title for the messages list',
  },
  participantsTitle: {
    id: 'app.userList.participantsTitle',
    description: 'Title for the Users list',
  },
  toggleCompactView: {
    id: 'app.userList.toggleCompactView.label',
    description: 'Toggle user list view mode',
  },
  ChatLabel: {
    id: 'app.userList.menu.chat.label',
    description: 'Save the changes and close the settings menu',
  },
  ClearStatusLabel: {
    id: 'app.userList.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
  },
  MakePresenterLabel: {
    id: 'app.userList.menu.makePresenter.label',
    description: 'Set this user to be the presenter in this meeting',
  },
  KickUserLabel: {
    id: 'app.userList.menu.kickUser.label',
    description: 'Forcefully remove this user from the meeting',
  },
  MuteUserAudioLabel: {
    id: 'app.userList.menu.muteUserAudio.label',
    description: 'Forcefully mute this user',
  },
  UnmuteUserAudioLabel: {
    id: 'app.userList.menu.unmuteUserAudio.label',
    description: 'Forcefully unmute this user',
  },
  PromoteUserLabel: {
    id: 'app.userList.menu.promoteUser.label',
    description: 'Forcefully promote this viewer to a moderator',
  },
  DemoteUserLabel: {
    id: 'app.userList.menu.demoteUser.label',
    description: 'Forcefully demote this moderator to a viewer',
  },
});

class UserMessages extends Component {
  constructor() {
    super();

    this.getMessagesListRef = this.getMessagesListRef.bind(this);
    this.getMessageItemsRef = this.getMessageItemsRef.bind(this);
  }

  componentDidMount() {
    if (!this.props.compact) {
      this._msgsList.addEventListener(
        'keydown',
        event => this.props.rovingIndex(
          event,
          this.getMessagesListRef(),
          this.getMessageItemsRef(),
          this.props.openChats.length,
        ),
      );

      document.addEventListener(
        'click',
        event => this.props.resetIndex(
          event,
          this.getMessagesListRef(),
          this.getMessageItemsRef(),
        ),
      );
    }
  }

  getMessagesListRef() {
    return ReactDOM.findDOMNode(this._msgsList);
  }

  getMessageItemsRef() {
    return ReactDOM.findDOMNode(this._msgItems);
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
          <div className={styles.list}>
            <TransitionGroup ref={(ref) => { this._msgItems = ref; }} >
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
