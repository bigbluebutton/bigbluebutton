import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import UserDropdown from './user-dropdown/component';

const propTypes = {
  currentUser: PropTypes.shape({
    id: PropTypes.string.isRequired,
  }).isRequired,

  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isBreakoutRoom: PropTypes.bool,
  getAvailableActions: PropTypes.func.isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  getScrollContainerRef: PropTypes.func.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
};

const defaultProps = {
  isBreakoutRoom: false,
};

class UserListItem extends PureComponent {
  render() {
    const {
      user,
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
      hasPrivateChatBetweenUsers,
      toggleUserLock,
    } = this.props;

    const { meetingId, lockSettingsProp } = meeting;

    const contents = (
      <UserDropdown
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
          meetingId,
          lockSettingsProp,
          normalizeEmojiName,
          removeUser,
          setEmojiStatus,
          toggleVoice,
          user,
          hasPrivateChatBetweenUsers,
          toggleUserLock,
        }}
      />
    );

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default injectIntl(UserListItem);
