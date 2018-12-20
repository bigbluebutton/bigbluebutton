import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BreakoutRoomContainer from '/imports/ui/components/breakout-room/container';
import UserListContainer from '/imports/ui/components/user-list/container';
import ChatContainer from '/imports/ui/components/chat/container';
import PollContainer from '/imports/ui/components/poll/container';
import { defineMessages, injectIntl } from 'react-intl';
import Resizable from 're-resizable';
import { styles } from '/imports/ui/components/app/styles';
import _ from 'lodash';

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

const propTypes = {
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  enableResize: PropTypes.bool.isRequired,
  openPanel: PropTypes.string.isRequired,
};

class PanelManager extends Component {
  constructor() {
    super();

    this.padKey = _.uniqueId('resize-pad-');
    this.userlistKey = _.uniqueId('userlist-');
    this.breakoutroomKey = _.uniqueId('breakoutroom-');
    this.chatKey = _.uniqueId('chat-');
    this.pollKey = _.uniqueId('poll-');
  }

  renderUserList() {
    const {
      intl,
      enableResize,
    } = this.props;

    return (
      <div
        className={styles.userList}
        aria-label={intl.formatMessage(intlMessages.userListLabel)}
        key={enableResize ? null : this.userlistKey}
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
        key={this.userlistKey}
      >
        {this.renderUserList()}
      </Resizable>
    );
  }

  renderChat() {
    const { intl, enableResize } = this.props;

    return (
      <section
        className={styles.chat}
        aria-label={intl.formatMessage(intlMessages.chatLabel)}
        key={enableResize ? null : this.chatKey}
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
        key={this.chatKey}
      >
        {this.renderChat()}
      </Resizable>
    );
  }

  renderPoll() {
    return (
      <div className={styles.poll} key={this.pollKey}>
        <PollContainer />
      </div>
    );
  }

  renderBreakoutRoom() {
    return (
      <div className={styles.breakoutRoom} key={this.breakoutroomKey}>
        <BreakoutRoomContainer />
      </div>
    );
  }

  render() {
    const { enableResize, openPanel } = this.props;
    if (openPanel === '') return null;

    const panels = [this.renderUserList()];
    const resizablePanels = [
      this.renderUserListResizable(),
      <div className={styles.userlistPad} key={this.padKey} />,
    ];

    if (openPanel === 'chat') {
      if (enableResize) {
        resizablePanels.push(this.renderChatResizable());
      } else {
        panels.push(this.renderChat());
      }
    }

    if (openPanel === 'poll') {
      if (enableResize) {
        resizablePanels.push(this.renderPoll());
      } else {
        panels.push(this.renderPoll());
      }
    }

    if (openPanel === 'breakoutroom') {
      if (enableResize) {
        resizablePanels.push(this.renderBreakoutRoom());
      } else {
        panels.push(this.renderBreakoutRoom());
      }
    }

    return enableResize
      ? resizablePanels
      : panels;
  }
}

export default injectIntl(PanelManager);

PanelManager.propTypes = propTypes;
