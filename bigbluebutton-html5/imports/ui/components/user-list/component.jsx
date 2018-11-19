import React, { Component } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles';
import CustomLogo from './custom-logo/component';
import UserContentContainer from './user-list-content/container';

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
  showBranding: PropTypes.bool.isRequired,
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
  // This one is kinda tricky, meteor takes sometime to fetch the data and passing down
  // So the first time its create, the meeting comes as null, sending an error to the client.
  meeting: {},
};

class UserList extends Component {
  render() {
    const {
      intl,
      openChats,
      users,
      compact,
      currentUser,
      isBreakoutRoom,
      setEmojiStatus,
      assignPresenter,
      removeUser,
      toggleVoice,
      muteAllUsers,
      muteAllExceptPresenter,
      changeRole,
      meeting,
      getAvailableActions,
      normalizeEmojiName,
      isMeetingLocked,
      isPublicChat,
      roving,
      CustomLogoUrl,
      getGroupChatPrivate,
      handleEmojiChange,
      getEmojiList,
      getEmoji,
      showBranding,
      hasBreakoutRoom,
    } = this.props;

    return (
      <div className={styles.userList}>
        {
          showBranding
          && !this.props.compact
          && CustomLogoUrl
          ? <CustomLogo CustomLogoUrl={CustomLogoUrl} /> : null
        }
        {<UserContentContainer
          {...{
          intl,
          openChats,
          users,
          compact,
          currentUser,
          isBreakoutRoom,
          setEmojiStatus,
          assignPresenter,
          removeUser,
          toggleVoice,
          muteAllUsers,
          muteAllExceptPresenter,
          changeRole,
          meeting,
          getAvailableActions,
          normalizeEmojiName,
          isMeetingLocked,
          isPublicChat,
          roving,
          getGroupChatPrivate,
          handleEmojiChange,
          getEmojiList,
          getEmoji,
          hasBreakoutRoom,
        }
      }
        />}
      </div>
    );
  }
}

UserList.propTypes = propTypes;
UserList.defaultProps = defaultProps;

export default injectWbResizeEvent(injectIntl(UserList));
