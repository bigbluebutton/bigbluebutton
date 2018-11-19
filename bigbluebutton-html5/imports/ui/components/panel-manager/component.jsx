import React, { Component } from 'react';
import BreakoutRoomContainer from '/imports/ui/components/breakout-room/container';
import UserListContainer from '/imports/ui/components/user-list/container';
import ChatContainer from '/imports/ui/components/chat/container';
import PollContainer from '/imports/ui/components/poll/container';
import { defineMessages, injectIntl } from 'react-intl';
import Resizable from 're-resizable';
import { styles } from '/imports/ui/components/app/styles';
import cx from 'classnames';

const intlMessages = defineMessages({
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  userListLabel: {
    id: 'app.userList.label',
    description: 'Aria-label for Userlist Nav',
  },
});

class PanelManager extends Component {
  constructor() {
    super();
  }

  renderUserList() {
    const {
      intl,
    } = this.props;

    const userListStyle = {};

    return (
      <div
        className={cx(styles.userList, userListStyle)}
        aria-label={intl.formatMessage(intlMessages.userListLabel)}
      >
        <UserListContainer />
      </div>
    );
  }

  renderUserListResizable() {
    // Variables for resizing user-list.
    const USERLIST_MIN_WIDTH_PX = 150;
    const USERLIST_MAX_WIDTH_PX = 240;
    const USERLIST_DEFAULT_WIDTH_RELATIVE = 18;

    // decide whether using pixel or percentage unit as a default width for userList
    const USERLIST_DEFAULT_WIDTH = (window.innerWidth * (USERLIST_DEFAULT_WIDTH_RELATIVE / 100.0)) < USERLIST_MAX_WIDTH_PX ? `${USERLIST_DEFAULT_WIDTH_RELATIVE}%` : USERLIST_MAX_WIDTH_PX;

    const resizableEnableOptions = {
      top: false,
      right: true,
      bottom: false,
      left: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false,
    };

    return (
      <Resizable
        defaultSize={{ width: USERLIST_DEFAULT_WIDTH }}
        minWidth={USERLIST_MIN_WIDTH_PX}
        maxWidth={USERLIST_MAX_WIDTH_PX}
        ref={(node) => { this.resizableUserList = node; }}
        className={styles.resizableUserList}
        enable={resizableEnableOptions}
      >
        {this.renderUserList()}
      </Resizable>
    );
  }

  renderChat() {
    const { intl } = this.props;

    return (
      <section
        className={styles.chat}
        aria-label={intl.formatMessage(intlMessages.chatLabel)}
      >
        <ChatContainer />
      </section>
    );
  }

  renderChatResizable() {
    // Variables for resizing chat.
    const CHAT_MIN_WIDTH = '10%';
    const CHAT_MAX_WIDTH = '25%';
    const CHAT_DEFAULT_WIDTH = '15%';

    const resizableEnableOptions = {
      top: false,
      right: true,
      bottom: false,
      left: false,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false,
    };

    return (
      <Resizable
        defaultSize={{ width: CHAT_DEFAULT_WIDTH }}
        minWidth={CHAT_MIN_WIDTH}
        maxWidth={CHAT_MAX_WIDTH}
        ref={(node) => { this.resizableChat = node; }}
        className={styles.resizableChat}
        enable={resizableEnableOptions}
      >
        {this.renderChat()}
      </Resizable>
    );
  }

  renderPoll() {
    return (
      <div className={styles.poll}>
        <PollContainer />
      </div>
    );
  }

  renderBreakoutRoom() {
    return (
      <div className={styles.breakoutRoom}>
        <BreakoutRoomContainer />
      </div>
    );
  }

  render() {
    switch (this.props.openPanel) {
      case 'chat': return [
        this.renderUserListResizable(),
        this.renderChatResizable(),
      ];
      case 'poll': return [
        this.renderUserListResizable(),
        this.renderPoll(),
      ];
      case 'breakoutroom': return [
        this.renderUserListResizable(),
        this.renderBreakoutRoom(),
      ];
      case 'userlist': return this.renderUserListResizable();
      default: break;
    }
    return null;
  }
}

export default injectIntl(PanelManager);
