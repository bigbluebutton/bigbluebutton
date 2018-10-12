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
      compact,
      user,
      intl,
      meeting,
      isMeetingLocked,
      normalizeEmojiName,
      getScrollContainerRef,
      assignPresenter,
      removeUser,
      toggleVoice,
      changeRole,
      setEmojiStatus,
      currentUser,
      isBreakoutRoom,
      getAvailableActions,
      handleEmojiChange,
      getEmojiList,
      getEmoji,
    } = this.props;

    const contents = (<UserDropdown
      {...{
        compact,
        user,
        intl,
        normalizeEmojiName,
        meeting,
        isMeetingLocked,
        getScrollContainerRef,
        assignPresenter,
        removeUser,
        toggleVoice,
        changeRole,
        setEmojiStatus,
        currentUser,
        isBreakoutRoom,
        getAvailableActions,
        handleEmojiChange,
        getEmojiList,
        getEmoji,
      }}
    />);

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default injectIntl(UserListItem);
