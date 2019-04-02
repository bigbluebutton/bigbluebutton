import React, { PureComponent } from 'react';
import { injectIntl } from 'react-intl';
import PropTypes from 'prop-types';
import injectWbResizeEvent from '/imports/ui/components/presentation/resize-wrapper/component';
import { styles } from './styles';
import CustomLogo from './custom-logo/component';
import UserContentContainer from './user-list-content/container';

const propTypes = {
  activeChats: PropTypes.arrayOf(String).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  CustomLogoUrl: PropTypes.string.isRequired,
  handleEmojiChange: PropTypes.func.isRequired,
  getUsersId: PropTypes.func.isRequired,
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
  toggleUserLock: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
};

class UserList extends PureComponent {
  render() {
    const {
      intl,
      activeChats,
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
      getUsersId,
      hasPrivateChatBetweenUsers,
      toggleUserLock,
    } = this.props;

    return (
      <div className={styles.userList}>
        {
          showBranding
            && !compact
            && CustomLogoUrl
            ? <CustomLogo CustomLogoUrl={CustomLogoUrl} /> : null
        }
        {<UserContentContainer
          {...{
            intl,
            activeChats,
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
            getUsersId,
            hasPrivateChatBetweenUsers,
            toggleUserLock,
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
