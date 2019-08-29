import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styles } from './styles';
import UserParticipantsContainer from './user-participants/container';
import UserMessages from './user-messages/component';
import UserNotesContainer from './user-notes/container';
import UserCaptionsContainer from './user-captions/container';
import WaitingUsers from './waiting-users/component';
import UserPolls from './user-polls/component';
import BreakoutRoomItem from './breakout-room/component';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
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
  pollIsOpen: PropTypes.bool.isRequired,
  forcePollOpen: PropTypes.bool.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
};
const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;
const CHAT_ENABLED = Meteor.settings.public.chat.enabled;

class UserContent extends PureComponent {
  render() {
    const {
      compact,
      intl,
      currentUser,
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
      hasPrivateChatBetweenUsers,
      toggleUserLock,
      pendingUsers,
      requestUserInformation,
    } = this.props;

    return (
      <div
        data-test="userListContent"
        className={styles.content}
        role="complementary"
      >
        {CHAT_ENABLED
          ? (<UserMessages
            {...{
              isPublicChat,
              activeChats,
              compact,
              intl,
              roving,
            }}
          />
          ) : null
        }
        {currentUser.role === ROLE_MODERATOR
          ? (
            <UserCaptionsContainer
              {...{
                intl,
              }}
            />
          ) : null
        }
        <UserNotesContainer
          {...{
            intl,
          }}
        />
        {pendingUsers.length > 0 && currentUser.role === ROLE_MODERATOR
          ? (
            <WaitingUsers
              {...{
                intl,
                pendingUsers,
              }}
            />
          ) : null
        }
        <UserPolls
          isPresenter={currentUser.presenter}
          {...{
            pollIsOpen,
            forcePollOpen,
          }}
        />
        <BreakoutRoomItem isPresenter={currentUser.presenter} hasBreakoutRoom={hasBreakoutRoom} />
        <UserParticipantsContainer
          {...{
            compact,
            intl,
            currentUser,
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
            hasPrivateChatBetweenUsers,
            toggleUserLock,
            requestUserInformation,
          }}
        />
      </div>
    );
  }
}

UserContent.propTypes = propTypes;
UserContent.defaultProps = defaultProps;

export default UserContent;
