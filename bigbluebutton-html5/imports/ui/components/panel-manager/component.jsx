import React, { Component } from 'react';
import PropTypes from 'prop-types';
import BreakoutRoomContainer from '/imports/ui/components/breakout-room/container';
import UserListContainer from '/imports/ui/components/user-list/container';
import ChatContainer from '/imports/ui/components/chat/container';
import NoteContainer from '/imports/ui/components/note/container';
import PollContainer from '/imports/ui/components/poll/container';
import CaptionsContainer from '/imports/ui/components/captions/pad/container';
import WaitingUsersPanel from '/imports/ui/components/waiting-users/container';
import { defineMessages, injectIntl } from 'react-intl';
import Resizable from 're-resizable';
import { styles } from '/imports/ui/components/app/styles';
import _ from 'lodash';
import { withLayoutConsumer } from '/imports/ui/components/layout/context';
import {
  USERLIST_MIN_WIDTH,
  USERLIST_MAX_WIDTH,
  CHAT_MIN_WIDTH,
  CHAT_MAX_WIDTH,
} from '/imports/ui/components/layout/layout-manager';
import { ACTIONS, PANELS } from '../layout/enums';

const intlMessages = defineMessages({
  chatLabel: {
    id: 'app.chat.label',
    description: 'Aria-label for Chat Section',
  },
  noteLabel: {
    id: 'app.note.label',
    description: 'Aria-label for Note Section',
  },
  captionsLabel: {
    id: 'app.captions.label',
    description: 'Aria-label for Captions Section',
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
  // openPanel: PropTypes.string.isRequired,
};


const DEFAULT_PANEL_WIDTH = 340;

// Variables for resizing user-list.
const USERLIST_MIN_WIDTH_PX = USERLIST_MIN_WIDTH;
const USERLIST_MAX_WIDTH_PX = USERLIST_MAX_WIDTH;

// Variables for resizing poll.
const POLL_MIN_WIDTH = 320;
const POLL_MAX_WIDTH = 400;

// Variables for resizing shared notes.
const NOTE_MIN_WIDTH = DEFAULT_PANEL_WIDTH;
const NOTE_MAX_WIDTH = 800;

// Variables for resizing captions.
const CAPTIONS_MIN_WIDTH = DEFAULT_PANEL_WIDTH;
const CAPTIONS_MAX_WIDTH = 400;

// Variables for resizing waiting users.
const WAITING_MIN_WIDTH = 300;
const WAITING_MAX_WIDTH = 350;

class PanelManager extends Component {
  constructor(props) {
    super(props);

    this.padKey = _.uniqueId('resize-pad-');
    this.userlistKey = _.uniqueId('userlist-');
    this.breakoutroomKey = _.uniqueId('breakoutroom-');
    this.chatKey = _.uniqueId('chat-');
    this.pollKey = _.uniqueId('poll-');
    this.noteKey = _.uniqueId('note-');
    this.captionsKey = _.uniqueId('captions-');
    this.waitingUsers = _.uniqueId('waitingUsers-');

    const { layoutContextState } = props;
    const { userListSize, secondPanelSize, chatSize } = layoutContextState;

    this.state = {
      userlistWidth: userListSize.width,
      chatWidth: secondPanelSize.width,
      noteWidth: DEFAULT_PANEL_WIDTH,
      captionsWidth: DEFAULT_PANEL_WIDTH,
      pollWidth: DEFAULT_PANEL_WIDTH,
      waitingWidth: DEFAULT_PANEL_WIDTH,
      breakoutRoomWidth: 0,
    };

    this.setUserListWidth = this.setUserListWidth.bind(this);
  }

  componentDidUpdate(prevProps) {
    const {
      userlistWidth,
      // chatWidth,
      // noteWidth,
      // captionsWidth,
      // pollWidth,
      // waitingWidth,
      // breakoutRoomWidth,
      secondPanelWidth,
    } = this.state;
    const { layoutContextState } = this.props;
    const {
      userListSize,
      // chatSize,
      secondPanelSize,
      // noteSize,
      // captionsSize,
      // pollSize,
      // waitingSize,
      // breakoutRoomSize,
    } = layoutContextState;
    const { layoutContextState: oldLayoutContextState } = prevProps;
    const {
      userListSize: oldUserListSize,
      // chatSize: oldChatSize,
      secondPanelSize: oldSecondPanelSize,
      // noteSize: oldNoteSize,
      // captionsSize: oldCaptionsSize,
      // pollSize: oldPollSize,
      // waitingSize: oldWaitingSize,
      // breakoutRoomSize: oldBreakoutRoomSize,
    } = oldLayoutContextState;

    if (userListSize.width !== oldUserListSize.width && userListSize.width !== userlistWidth) {
      this.setUserListWidth(userListSize.width);
    }
    // if (chatSize.width !== oldChatSize.width && chatSize.width !== chatWidth) {
    //   this.setChatWidth(chatSize.width);
    // }
    // if (noteSize.width !== oldNoteSize.width && noteSize.width !== noteWidth) {
    //   this.setNoteWidth(noteSize.width);
    // }
    // if (captionsSize.width !== oldCaptionsSize.width && captionsSize.width !== captionsWidth) {
    //   this.setCaptionsWidth(captionsSize.width);
    // }
    // if (pollSize.width !== oldPollSize.width && pollSize.width !== pollWidth) {
    //   this.setPollWidth(pollSize.width);
    // }
    // if (waitingSize.width !== oldWaitingSize.width && waitingSize.width !== waitingWidth) {
    //   this.setWaitingWidth(waitingSize.width);
    // }
    // if (breakoutRoomSize.width !== oldBreakoutRoomSize.width
    //   && breakoutRoomSize.width !== breakoutRoomWidth) {
    //   this.setBreakoutRoomWidth(breakoutRoomSize.width);
    // }
    if (secondPanelSize.width !== oldSecondPanelSize.width && secondPanelSize.width !== secondPanelWidth) {
      this.setSecondPanelWidth(secondPanelSize.width);
    }
    // if (secondPanelSize.width !== oldSecondPanelSize.width && secondPanelSize.width !== chatWidth) {
    //   this.setChatWidth(secondPanelSize.width);
    // }
    // if (secondPanelSize.width !== oldSecondPanelSize.width && secondPanelSize.width !== noteWidth) {
    //   this.setNoteWidth(secondPanelSize.width);
    // }
    // if (secondPanelSize.width !== oldSecondPanelSize.width && secondPanelSize.width !== captionsWidth) {
    //   this.setCaptionsWidth(secondPanelSize.width);
    // }
    // if (secondPanelSize.width !== oldSecondPanelSize.width && secondPanelSize.width !== pollWidth) {
    //   this.setPollWidth(secondPanelSize.width);
    // }
    // if (secondPanelSize.width !== oldSecondPanelSize.width && secondPanelSize.width !== waitingWidth) {
    //   this.setWaitingWidth(secondPanelSize.width);
    // }
    // if (secondPanelSize.width !== oldSecondPanelSize.width
    //   && secondPanelSize.width !== breakoutRoomWidth) {
    //   this.setBreakoutRoomWidth(secondPanelSize.width);
    // }
  }

  setUserListWidth(userlistWidth) {
    this.setState({ userlistWidth });
  }

  setSecondPanelWidth(secondPanelWidth) {
    this.setState({ secondPanelWidth });
  }

  // setChatWidth(chatWidth) {
  //   this.setState({ chatWidth });
  // }

  // setNoteWidth(noteWidth) {
  //   this.setState({ noteWidth });
  // }

  // setCaptionsWidth(captionsWidth) {
  //   this.setState({ captionsWidth });
  // }

  // setPollWidth(pollWidth) {
  //   this.setState({ pollWidth });
  // }

  // setWaitingWidth(waitingWidth) {
  //   this.setState({ waitingWidth });
  // }

  // setBreakoutRoomWidth(breakoutRoomWidth) {
  //   this.setState({ breakoutRoomWidth });
  // }

  userListResizeStop(addvalue) {
    const { userlistWidth } = this.state;
    const { layoutContextDispatch } = this.props;

    this.setUserListWidth(userlistWidth + addvalue);

    layoutContextDispatch(
      {
        type: 'setUserListSize',
        value: {
          width: userlistWidth + addvalue,
        },
      },
    );

    window.dispatchEvent(new Event('panelChanged'));
  }

  chatResizeStop(addvalue) {
    const { secondPanelWidth } = this.state;
    const { layoutContextDispatch } = this.props;

    // this.setChatWidth(chatWidth + addvalue);
    const newSecondPanelWidth = secondPanelWidth + addvalue;
    this.setSecondPanelWidth(newSecondPanelWidth);

    layoutContextDispatch(
      {
        type: 'setSecondPanelSize',
        value: {
          width: newSecondPanelWidth,
        },
      },
    );

    window.dispatchEvent(new Event('panelChanged'));
  }

  noteResizeStop(addvalue) {
    const { secondPanelWidth } = this.state;
    const { layoutContextDispatch } = this.props;

    // this.setNoteWidth(noteWidth + addvalue);
    const newSecondPanelWidth = secondPanelWidth + addvalue;
    this.setSecondPanelWidth(newSecondPanelWidth);

    layoutContextDispatch(
      {
        type: 'setNoteSize',
        value: {
          width: newSecondPanelWidth,
        },
      },
    );

    window.dispatchEvent(new Event('panelChanged'));
  }

  captionsResizeStop(addvalue) {
    const { secondPanelWidth } = this.state;
    const { layoutContextDispatch } = this.props;

    // this.setCaptionsWidth(captionsWidth + addvalue);
    const newSecondPanelWidth = secondPanelWidth + addvalue;
    this.setSecondPanelWidth(newSecondPanelWidth);

    layoutContextDispatch(
      {
        type: 'setCaptionsSize',
        value: {
          width: newSecondPanelWidth,
        },
      },
    );

    window.dispatchEvent(new Event('panelChanged'));
  }

  pollResizeStop(addvalue) {
    const { secondPanelWidth } = this.state;
    const { layoutContextDispatch } = this.props;

    // this.setPollWidth(pollWidth + addvalue);
    const newSecondPanelWidth = secondPanelWidth + addvalue;
    this.setSecondPanelWidth(newSecondPanelWidth);

    layoutContextDispatch(
      {
        type: 'setPollSize',
        value: {
          width: newSecondPanelWidth,
        },
      },
    );

    window.dispatchEvent(new Event('panelChanged'));
  }

  waitingResizeStop(addvalue) {
    const { secondPanelWidth } = this.state;
    const { layoutContextDispatch } = this.props;

    // this.setWaitingWidth(waitingWidth + addvalue);
    const newSecondPanelWidth = secondPanelWidth + addvalue;
    this.setSecondPanelWidth(newSecondPanelWidth);

    layoutContextDispatch(
      {
        type: 'setWaitingUsersPanelSize',
        value: {
          width: newSecondPanelWidth,
        },
      },
    );

    window.dispatchEvent(new Event('panelChanged'));
  }

  renderUserList() {
    const {
      intl,
      enableResize,
      // openPanel,
      shouldAriaHide,
    } = this.props;

    // TODO Verify this condition
    const ariaHidden = shouldAriaHide(); //&& openPanel !== 'userlist';

    return (
      <div
        className={styles.userList}
        aria-label={intl.formatMessage(intlMessages.userListLabel)}
        key={enableResize ? null : this.userlistKey}
        aria-hidden={ariaHidden}
      >
        <UserListContainer />
      </div>
    );
  }

  renderUserListResizable() {
    const { userlistWidth } = this.state;
    const { isRTL } = this.props;

    const resizableEnableOptions = {
      top: false,
      right: !isRTL,
      bottom: false,
      left: !!isRTL,
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
        onResizeStop={(e, direction, ref, d) => {
          this.userListResizeStop(d.width);
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
    const { secondPanelWidth } = this.state;
    const { isRTL } = this.props;

    const resizableEnableOptions = {
      top: false,
      right: !isRTL,
      bottom: false,
      left: !!isRTL,
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
        size={{ width: secondPanelWidth }}
        onResizeStop={(e, direction, ref, d) => {
          this.chatResizeStop(d.width);
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
    const { secondPanelWidth } = this.state;
    const { isRTL } = this.props;

    const resizableEnableOptions = {
      top: false,
      right: !isRTL,
      bottom: false,
      left: !!isRTL,
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
        size={{ width: secondPanelWidth }}
        onResizeStop={(e, direction, ref, d) => {
          this.noteResizeStop(d.width);
        }}
      >
        {this.renderNote()}
      </Resizable>
    );
  }

  renderCaptions() {
    const { intl, enableResize } = this.props;

    return (
      <section
        className={styles.captions}
        aria-label={intl.formatMessage(intlMessages.captionsLabel)}
        key={enableResize ? null : this.captionsKey}
      >
        <CaptionsContainer />
      </section>
    );
  }

  renderCaptionsResizable() {
    const { secondPanelWidth } = this.state;
    const { isRTL } = this.props;

    const resizableEnableOptions = {
      top: false,
      right: !isRTL,
      bottom: false,
      left: !!isRTL,
      topRight: false,
      bottomRight: false,
      bottomLeft: false,
      topLeft: false,
    };

    return (
      <Resizable
        minWidth={CAPTIONS_MIN_WIDTH}
        maxWidth={CAPTIONS_MAX_WIDTH}
        ref={(node) => { this.resizableCaptions = node; }}
        enable={resizableEnableOptions}
        key={this.captionsKey}
        size={{ width: secondPanelWidth }}
        onResizeStop={(e, direction, ref, d) => {
          this.captionsResizeStop(secondPanelWidth + d.width);
        }}
      >
        {this.renderCaptions()}
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
    const { secondPanelWidth } = this.state;
    const { isRTL } = this.props;

    const resizableEnableOptions = {
      top: false,
      right: !isRTL,
      bottom: false,
      left: !!isRTL,
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
        size={{ width: secondPanelWidth }}
        onResizeStop={(e, direction, ref, d) => {
          this.waitingResizeStop(secondPanelWidth + d.width);
        }}
      >
        {this.renderWaitingUsersPanel()}
      </Resizable>
    );
  }

  renderBreakoutRoom() {
    const { secondPanelWidth } = this.state;
    return (
      <div
        className={styles.breakoutRoom}
        key={this.breakoutroomKey}
        style={{
          width: secondPanelWidth,
        }}
      >
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
    const { secondPanelWidth } = this.state;
    const { isRTL } = this.props;

    const resizableEnableOptions = {
      top: false,
      right: !isRTL,
      bottom: false,
      left: !!isRTL,
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
        size={{ width: secondPanelWidth }}
        onResizeStop={(e, direction, ref, d) => {
          // window.dispatchEvent(new Event('resize'));
          this.pollResizeStop(secondPanelWidth + d.width);
        }}
      >
        {this.renderPoll()}
      </Resizable>
    );
  }

  render() {
    const {
      enableResize,
      sidebarNavPanel,
      sidebarContentPanel,
    } = this.props;
    if (sidebarNavPanel === PANELS.NONE && sidebarContentPanel === PANELS.NONE) return null;
    const panels = [];

    if (sidebarNavPanel === PANELS.USERLIST) {
      if (enableResize) {
        panels.push(
          this.renderUserListResizable(),
          <div className={styles.userlistPad} key={this.padKey} />,
        );
      } else {
        panels.push(this.renderUserList());
      }
    }

    if (sidebarContentPanel === PANELS.CHAT) {
      if (enableResize) {
        panels.push(this.renderChatResizable());
      } else {
        panels.push(this.renderChat());
      }
    }

    if (sidebarContentPanel === PANELS.SHARED_NOTES) {
      if (enableResize) {
        panels.push(this.renderNoteResizable());
      } else {
        panels.push(this.renderNote());
      }
    }

    if (sidebarContentPanel === PANELS.CAPTIONS) {
      if (enableResize) {
        panels.push(this.renderCaptionsResizable());
      } else {
        panels.push(this.renderCaptions());
      }
    }

    if (sidebarContentPanel === PANELS.POLL) {
      if (enableResize) {
        panels.push(this.renderPollResizable());
      } else {
        panels.push(this.renderPoll());
      }
    }
    if (sidebarContentPanel === PANELS.BREAKOUT) {
      if (enableResize) {
        panels.push(this.renderBreakoutRoom());
      } else {
        panels.push(this.renderBreakoutRoom());
      }
    }

    if (sidebarContentPanel === PANELS.WAITING_USERS) {
      if (enableResize) {
        panels.push(this.renderWaitingUsersPanelResizable());
      } else {
        panels.push(this.renderWaitingUsersPanel());
      }
    }

    return panels;
  }
}

export default injectIntl(withLayoutConsumer(PanelManager));

PanelManager.propTypes = propTypes;
