import React, { Component } from 'react';
import CSSTransitionGroup from 'react-transition-group/CSSTransitionGroup';
import PropTypes from 'prop-types';
import { defineMessages } from 'react-intl';
import cx from 'classnames';
import styles from './../../styles.scss';
import ChatListItem from './../../chat-list-item/component';

const propTypes = {
  openChats: PropTypes.arrayOf(String).isRequired,
  openChat: PropTypes.string,
  compact: PropTypes.bool,
  intl: PropTypes.shape({}).isRequired,
  rovingIndex: PropTypes.func.isRequired,
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
    id: 'app.userlist.usersTitle',
    description: 'Title for the Header',
  },
  messagesTitle: {
    id: 'app.userlist.messagesTitle',
    description: 'Title for the messages list',
  },
  participantsTitle: {
    id: 'app.userlist.participantsTitle',
    description: 'Title for the Users list',
  },
  toggleCompactView: {
    id: 'app.userlist.toggleCompactView.label',
    description: 'Toggle user list view mode',
  },
  ChatLabel: {
    id: 'app.userlist.menu.chat.label',
    description: 'Save the changes and close the settings menu',
  },
  ClearStatusLabel: {
    id: 'app.userlist.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
  },
  MakePresenterLabel: {
    id: 'app.userlist.menu.makePresenter.label',
    description: 'Set this user to be the presenter in this meeting',
  },
  KickUserLabel: {
    id: 'app.userlist.menu.kickUser.label',
    description: 'Forcefully remove this user from the meeting',
  },
  MuteUserAudioLabel: {
    id: 'app.userlist.menu.muteUserAudio.label',
    description: 'Forcefully mute this user',
  },
  UnmuteUserAudioLabel: {
    id: 'app.userlist.menu.unmuteUserAudio.label',
    description: 'Forcefully unmute this user',
  },
  PromoteUserLabel: {
    id: 'app.userlist.menu.promoteUser.label',
    description: 'Forcefully promote this viewer to a moderator',
  },
  DemoteUserLabel: {
    id: 'app.userlist.menu.demoteUser.label',
    description: 'Forcefully demote this moderator to a viewer',
  },
});

class UserMessages extends Component {

  componentDidMount() {
    if (!this.props.compact) {
      this._msgsList.addEventListener('keydown',
        event => this.props.rovingIndex(event,
                                        this._msgsList,
                                        this._msgItems,
                                        this.props.openChats.length));
    }
  }

  render() {
    const {
      openChats,
      openChat,
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
          <CSSTransitionGroup
            transitionName={listTransition}
            transitionAppear
            transitionEnter
            transitionLeave={false}
            transitionAppearTimeout={0}
            transitionEnterTimeout={0}
            transitionLeaveTimeout={0}
            component="div"
            className={cx(styles.chatsList, styles.scrollableList)}
          >
            <div ref={(ref) => { this._msgItems = ref; }}>
              {openChats.map(chat => (
                <ChatListItem
                  compact={compact}
                  key={chat.id}
                  openChat={openChat}
                  chat={chat}
                  tabIndex={-1}
                />
              ))}
            </div>
          </CSSTransitionGroup>
        </div>
      </div>
    );
  }
}

UserMessages.propTypes = propTypes;
UserMessages.defaultProps = defaultProps;

export default UserMessages;
