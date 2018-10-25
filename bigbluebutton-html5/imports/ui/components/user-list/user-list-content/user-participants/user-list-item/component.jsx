import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import UserDropdown from './user-dropdown/component';

const propTypes = {
  user: PropTypes.shape({
    name: PropTypes.string.isRequired,
    isPresenter: PropTypes.bool.isRequired,
    isVoiceUser: PropTypes.bool.isRequired,
    isModerator: PropTypes.bool.isRequired,
    image: PropTypes.string,
  }).isRequired,

  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,

  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isBreakoutRoom: PropTypes.bool,
  getAvailableActions: PropTypes.func.isRequired,
  meeting: PropTypes.shape({}).isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  getScrollContainerRef: PropTypes.func.isRequired,
};

const defaultProps = {
  isBreakoutRoom: false,
};

class UserListItem extends Component {
  render() {
    const {
      assignPresenter,
      compact,
      currentUser,
      changeRole,
      getAvailableActions,
      getEmoji,
      getEmojiList,
      getGroupChatPrivate,
      getScrollContainerRef,
      handleEmojiChange,
      intl,
      isBreakoutRoom,
      isMeetingLocked,
      meeting,
      normalizeEmojiName,
      removeUser,
      setEmojiStatus,
      toggleVoice,
      user,
    } = this.props;

    const contents = (<UserDropdown
      {...{
        assignPresenter,
        compact,
        currentUser,
        changeRole,
        getAvailableActions,
        getEmoji,
        getEmojiList,
        getGroupChatPrivate,
        getScrollContainerRef,
        handleEmojiChange,
        intl,
        isBreakoutRoom,
        isMeetingLocked,
        meeting,
        normalizeEmojiName,
        removeUser,
        setEmojiStatus,
        toggleVoice,
        user,
      }}
    />);

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default injectIntl(UserListItem);
