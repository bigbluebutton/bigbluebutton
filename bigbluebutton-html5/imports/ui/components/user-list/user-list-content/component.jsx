import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './styles';
import UserParticipantsContainer from './user-participants/container';
import UserMessages from './user-messages/component';
import UserNotes from './user-notes/component';
import UserPolls from './user-polls/component';
import BreakoutRoomItem from './breakout-room/component';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  isBreakoutRoom: PropTypes.bool,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  isPublicChat: PropTypes.func.isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  assignPresenter: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
  toggleVoice: PropTypes.func.isRequired,
  muteAllUsers: PropTypes.func.isRequired,
  muteAllExceptPresenter: PropTypes.func.isRequired,
  changeRole: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  getGroupChatPrivate: PropTypes.func.isRequired,
  handleEmojiChange: PropTypes.func.isRequired,
  getUsersId: PropTypes.func.isRequired,
  pollIsOpen: PropTypes.bool.isRequired,
  forcePollOpen: PropTypes.bool.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
};

class UserContent extends PureComponent {
  render() {
    const {
      compact,
      intl,
      currentUser,
      isBreakoutRoom,
      setEmojiStatus,
      assignPresenter,
      removeUser,
      toggleVoice,
      muteAllUsers,
      muteAllExceptPresenter,
      changeRole,
      getAvailableActions,
      normalizeEmojiName,
      isMeetingLocked,
      roving,
      handleEmojiChange,
      getEmojiList,
      getEmoji,
      isPublicChat,
      activeChats,
      getGroupChatPrivate,
      pollIsOpen,
      forcePollOpen,
      hasBreakoutRoom,
      getUsersId,
      hasPrivateChatBetweenUsers,
      toggleUserLock,
    } = this.props;

    return (
      <div
        data-test="userListContent"
        className={styles.content}
        role="complementary"
      >
        <UserMessages
          {...{
            isPublicChat,
            activeChats,
            compact,
            intl,
            roving,
          }}
        />
        <UserNotes
          {...{
            intl,
          }}
        />
        <UserPolls
          isPresenter={currentUser.isPresenter}
          {...{
            pollIsOpen,
            forcePollOpen,
          }}
        />
        <BreakoutRoomItem isPresenter={currentUser.isPresenter} hasBreakoutRoom={hasBreakoutRoom} />
        <UserParticipantsContainer
          {...{
            compact,
            intl,
            currentUser,
            isBreakoutRoom,
            setEmojiStatus,
            assignPresenter,
            removeUser,
            toggleVoice,
            muteAllUsers,
            muteAllExceptPresenter,
            changeRole,
            getAvailableActions,
            normalizeEmojiName,
            isMeetingLocked,
            roving,
            handleEmojiChange,
            getEmojiList,
            getEmoji,
            getGroupChatPrivate,
            getUsersId,
            hasPrivateChatBetweenUsers,
            toggleUserLock,
          }}
        />
      </div>
    );
  }
}

UserContent.propTypes = propTypes;
UserContent.defaultProps = defaultProps;

export default UserContent;
