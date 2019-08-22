import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { injectIntl } from 'react-intl';
import UserDropdown from './user-dropdown/component';

const propTypes = {
  compact: PropTypes.bool.isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  isBreakoutRoom: PropTypes.bool,
  getAvailableActions: PropTypes.func.isRequired,
  isThisMeetingLocked: PropTypes.bool.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  getScrollContainerRef: PropTypes.func.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
  isMeteorConnected: PropTypes.bool.isRequired,
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
      isThisMeetingLocked,
      meeting,
      normalizeEmojiName,
      removeUser,
      setEmojiStatus,
      toggleVoice,
      hasPrivateChatBetweenUsers,
      toggleUserLock,
      requestUserInformation,
      userInBreakout,
      breakoutSequence,
      meetingIsBreakout,
      isMeteorConnected,
      isModerator,
      isMe,
      getMyVoiceUser,
    } = this.props;

    const { lockSettingsProps } = meeting;

    const contents = (
      <UserDropdown
        {...{
          assignPresenter,
          compact,
          changeRole,
          currentUser,
          getAvailableActions,
          getEmoji,
          getEmojiList,
          getGroupChatPrivate,
          getScrollContainerRef,
          handleEmojiChange,
          intl,
          isBreakoutRoom,
          isThisMeetingLocked,
          lockSettingsProps,
          normalizeEmojiName,
          removeUser,
          setEmojiStatus,
          toggleVoice,
          user,
          hasPrivateChatBetweenUsers,
          toggleUserLock,
          requestUserInformation,
          userInBreakout,
          breakoutSequence,
          meetingIsBreakout,
          isMeteorConnected,
          isModerator,
          isMe,
          getMyVoiceUser,
        }}
      />
    );

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default injectIntl(UserListItem);
