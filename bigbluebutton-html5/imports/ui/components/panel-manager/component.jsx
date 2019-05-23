import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BreakoutRoomContainer from '/imports/ui/components/breakout-room/container';
import UserListContainer from '/imports/ui/components/user-list/container';
import ChatContainer from '/imports/ui/components/chat/container';
import NoteContainer from '/imports/ui/components/note/container';
import PollContainer from '/imports/ui/components/poll/container';
import WaitingUsersPanel from '/imports/ui/components/waiting-users/container';
import { defineMessages, injectIntl } from 'react-intl';
import Resizable from 're-resizable';
import { styles } from '/imports/ui/components/app/styles';
import _ from 'lodash';

const intlMessages = defineMessages({
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  noteLabel: {
    id: 'app.note.label',
    description: 'Aria-label for Note Section',
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


const DEFAULT_PANEL_WIDTH = 340;

// Variables for resizing user-list.
const USERLIST_MIN_WIDTH_PX = 150;
const USERLIST_MAX_WIDTH_PX = 240;

// Variables for resizing chat.
const CHAT_MIN_WIDTH = 150;
const CHAT_MAX_WIDTH = 350;

// Variables for resizing poll.
const POLL_MIN_WIDTH = 320;
const POLL_MAX_WIDTH = 400;

// Variables for resizing shared notes.
const NOTE_MIN_WIDTH = DEFAULT_PANEL_WIDTH;
const NOTE_MAX_WIDTH = 800;

// Variables for resizing waiting users.
const WAITING_MIN_WIDTH = DEFAULT_PANEL_WIDTH;
const WAITING_MAX_WIDTH = 800;

const dispatchResizeEvent = () => window.dispatchEvent(new Event('resize'));

class PanelManager extends Component {
  constructor() {
    super();

    this.padKey = _.uniqueId('resize-pad-');
    this.userlistKey = _.uniqueId('userlist-');
    this.breakoutroomKey = _.uniqueId('breakoutroom-');
    this.chatKey = _.uniqueId('chat-');
    this.pollKey = _.uniqueId('poll-');
    this.noteKey = _.uniqueId('note-');
    this.waitingUsers = _.uniqueId('waitingUsers-');

    this.state = {
      chatWidth: DEFAULT_PANEL_WIDTH,
      pollWidth: DEFAULT_PANEL_WIDTH,
      userlistWidth: 180,
      noteWidth: DEFAULT_PANEL_WIDTH,
      waitingWidth: DEFAULT_PANEL_WIDTH,
    };
  }

  componentDidUpdate(prevProps) {
    const { openPanel } = this.props;
    const { openPanel: oldOpenPanel } = prevProps;

    if (openPanel !== oldOpenPanel) {
      window.dispatchEvent(new Event('resize'));
    }
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
    const { userlistWidth } = this.state;

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
        minWidth={USERLIST_MIN_WIDTH_PX}
        maxWidth={USERLIST_MAX_WIDTH_PX}
        ref={(node) => { this.resizableUserList = node; }}
        enable={resizableEnableOptions}
        key={this.userlistKey}
        size={{ width: userlistWidth }}
        onResize={dispatchResizeEvent}
        onResizeStop={(e, direction, ref, d) => {
          this.setState({
            userlistWidth: userlistWidth + d.width,
          });
        }}
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
    const { chatWidth } = this.state;

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
        minWidth={CHAT_MIN_WIDTH}
        maxWidth={CHAT_MAX_WIDTH}
        ref={(node) => { this.resizableChat = node; }}
        enable={resizableEnableOptions}
        key={this.chatKey}
        size={{ width: chatWidth }}
        onResize={dispatchResizeEvent}
        onResizeStop={(e, direction, ref, d) => {
          this.setState({
            chatWidth: chatWidth + d.width,
          });
        }}
      >
        {this.renderChat()}
      </Resizable>
    );
  }

  renderNote() {
    const { intl, enableResize } = this.props;

    return (
      <section
        className={styles.note}
        aria-label={intl.formatMessage(intlMessages.noteLabel)}
        key={enableResize ? null : this.noteKey}
      >
        <NoteContainer />
      </section>
    );
  }

  renderNoteResizable() {
    const { noteWidth } = this.state;

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
        minWidth={NOTE_MIN_WIDTH}
        maxWidth={NOTE_MAX_WIDTH}
        ref={(node) => { this.resizableNote = node; }}
        enable={resizableEnableOptions}
        key={this.noteKey}
        size={{ width: noteWidth }}
        onResize={dispatchResizeEvent}
        onResizeStop={(e, direction, ref, d) => {
          this.setState({
            noteWidth: noteWidth + d.width,
          });
        }}
      >
        {this.renderNote()}
      </Resizable>
    );
  }

  renderWaitingUsersPanel() {
    const { intl, enableResize } = this.props;

    return (
      <section
        className={styles.note}
        aria-label={intl.formatMessage(intlMessages.noteLabel)}
        key={enableResize ? null : this.waitingUsers}
      >
        <WaitingUsersPanel />
      </section>
    );
  }

  renderWaitingUsersPanelResizable() {
    const { waitingWidth } = this.state;

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
        minWidth={WAITING_MIN_WIDTH}
        maxWidth={WAITING_MAX_WIDTH}
        ref={(node) => { this.resizableWaitingUsersPanel = node; }}
        enable={resizableEnableOptions}
        key={this.waitingUsers}
        size={{ width: waitingWidth }}
        onResize={dispatchResizeEvent}
        onResizeStop={(e, direction, ref, d) => {
          this.setState({
            waitingWidth: waitingWidth + d.width,
          });
        }}
      >
        {this.renderWaitingUsersPanel()}
      </Resizable>
    );
  }

  renderBreakoutRoom() {
    return (
      <div className={styles.breakoutRoom} key={this.breakoutroomKey}>
        <BreakoutRoomContainer />
      </div>
    );
  }

  renderPoll() {
    return (
      <div className={styles.poll} key={this.pollKey}>
        <PollContainer />
      </div>
    );
  }

  renderPollResizable() {
    const { pollWidth } = this.state;

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
        minWidth={POLL_MIN_WIDTH}
        maxWidth={POLL_MAX_WIDTH}
        ref={(node) => { this.resizablePoll = node; }}
        enable={resizableEnableOptions}
        key={this.pollKey}
        size={{ width: pollWidth }}
        onResizeStop={(e, direction, ref, d) => {
          window.dispatchEvent(new Event('resize'));
          this.setState({
            pollWidth: pollWidth + d.width,
          });
        }}
      >
        {this.renderPoll()}
      </Resizable>
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

    if (openPanel === 'note') {
      if (enableResize) {
        resizablePanels.push(this.renderNoteResizable());
      } else {
        panels.push(this.renderNote());
      }
    }

    if (openPanel === 'poll') {
      if (enableResize) {
        resizablePanels.push(this.renderPollResizable());
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

    if (openPanel === 'waitingUsersPanel') {
      if (enableResize) {
        resizablePanels.push(this.renderWaitingUsersPanelResizable());
      } else {
        panels.push(this.renderWaitingUsersPanel());
      }
    }

    return enableResize
      ? resizablePanels
      : panels;
  }
}

export default injectIntl(PanelManager);

PanelManager.propTypes = propTypes;
