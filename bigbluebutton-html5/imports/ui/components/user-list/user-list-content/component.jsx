import React, { Component } from 'react';
import PropTypes from 'prop-types';
import KEY_CODES from '/imports/utils/keyCodes';
import styles from './styles';
import UserParticipants from './user-participants/component';
import UserMessages from './user-messages/component';

const propTypes = {
  openChats: PropTypes.arrayOf(String).isRequired,
  users: PropTypes.arrayOf(Object).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  meeting: PropTypes.shape({}),
  isBreakoutRoom: PropTypes.bool,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  assignPresenter: PropTypes.func.isRequired,
  kickUser: PropTypes.func.isRequired,
  toggleVoice: PropTypes.func.isRequired,
  changeRole: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
  // This one is kinda tricky, meteor takes sometime to fetch the data and passing down
  // So the first time its create, the meeting comes as null, sending an error to the client.
  meeting: {},
};

class UserContent extends Component {
  static focusElement(active, element) {
    const modifiedActive = active;
    const modifiedElement = element;
    if (!modifiedActive.getAttribute('role') === 'tabpanel') {
      modifiedActive.tabIndex = -1;
    }
    modifiedElement.tabIndex = 0;
    modifiedElement.focus();
  }

  static removeFocusFromChildren(children, numberOfItems) {
    const modifiedChildren = children;
    for (let i = 0; i < numberOfItems; i += 1) {
      modifiedChildren.childNodes[i].tabIndex = -1;
    }
  }

  constructor(props) {
    super(props);

    this.rovingIndex = this.rovingIndex.bind(this);
    this.focusList = this.focusList.bind(this);
    this.focusedItemIndex = -1;
  }

  focusList(list) {
    const focusList = list;
    document.activeElement.tabIndex = -1;
    this.focusedItemIndex = -1;
    focusList.tabIndex = 0;
    focusList.focus();
  }


  rovingIndex(event, list, items, numberOfItems) {
    const active = document.activeElement;
    const changedItems = items;

    if (event.keyCode === KEY_CODES.TAB) {
      if (this.focusedItemIndex !== -1) {
        this.focusedItemIndex = 0;
        UserContent.removeFocusFromChildren(changedItems, numberOfItems);
      }
    }

    if (event.keyCode === KEY_CODES.ESCAPE
      || this.focusedItemIndex < 0
      || this.focusedItemIndex > numberOfItems) {
      this.focusList(list);
    }

    if ([KEY_CODES.ARROW_RIGHT, KEY_CODES.ARROW_SPACE].includes(event.keyCode)) {
      active.firstChild.click();
    }

    if (event.keyCode === KEY_CODES.ARROW_DOWN) {
      this.focusedItemIndex += 1;

      if (this.focusedItemIndex === numberOfItems) {
        this.focusedItemIndex = 0;
      }
      UserContent.focusElement(active, changedItems.childNodes[this.focusedItemIndex]);
    }

    if (event.keyCode === KEY_CODES.ARROW_UP) {
      this.focusedItemIndex -= 1;

      if (this.focusedItemIndex < 0) {
        this.focusedItemIndex = numberOfItems - 1;
      }

      UserContent.focusElement(active, changedItems.childNodes[this.focusedItemIndex]);
    }
  }

  render() {
    return (
      <div className={styles.content}>
        <UserMessages
          isPublicChat={this.props.isPublicChat}
          openChats={this.props.openChats}
          compact={this.props.compact}
          intl={this.props.intl}
          rovingIndex={this.rovingIndex}
        />
        <UserParticipants
          users={this.props.users}
          compact={this.props.compact}
          intl={this.props.intl}
          currentUser={this.props.currentUser}
          meeting={this.props.meeting}
          isBreakoutRoom={this.props.isBreakoutRoom}
          setEmojiStatus={this.props.setEmojiStatus}
          assignPresenter={this.props.assignPresenter}
          kickUser={this.props.kickUser}
          toggleVoice={this.props.toggleVoice}
          changeRole={this.props.changeRole}
          getAvailableActions={this.props.getAvailableActions}
          normalizeEmojiName={this.props.normalizeEmojiName}
          rovingIndex={this.rovingIndex}
          isMeetingLocked={this.props.isMeetingLocked}
        />
      </div>
    );
  }
}

UserContent.propTypes = propTypes;
UserContent.defaultProps = defaultProps;

export default UserContent;
