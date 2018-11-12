import React from 'react';
import PropTypes from 'prop-types';
import { styles } from './styles';
import UserParticipants from './user-participants/component';
import UserMessages from './user-messages/component';
import UserPolls from './user-polls/component';
import BreakoutRoomItem from './breakout-room/component';

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
  removeUser: PropTypes.func.isRequired,
  toggleVoice: PropTypes.func.isRequired,
  muteAllUsers: PropTypes.func.isRequired,
  muteAllExceptPresenter: PropTypes.func.isRequired,
  changeRole: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  getGroupChatPrivate: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
  // This one is kinda tricky, meteor takes sometime to fetch the data and passing down
  // So the first time its create, the meeting comes as null, sending an error to the client.
  meeting: {},
};

class UserContent extends React.Component {
  render() {
    const {
      users,
      compact,
      intl,
      currentUser,
      meeting,
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
      openChats,
      getGroupChatPrivate,
      pollIsOpen,
      forcePollOpen,
      hasBreakoutRoom,
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
            openChats,
            compact,
            intl,
            roving,
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
        <UserParticipants
          {...{
            users,
            compact,
            intl,
            currentUser,
            meeting,
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
          }}
        />
      </div>
    );
  }
}

UserContent.propTypes = propTypes;
UserContent.defaultProps = defaultProps;

export default UserContent;
