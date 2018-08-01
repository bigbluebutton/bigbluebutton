import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
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
  router: PropTypes.shape({}).isRequired,
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
      router,
      isBreakoutRoom,
      getAvailableActions,
      handleEmojiChange,
      getEmojiList,
      getEmoji,
    } = this.props;

    const contents = (<UserDropdown
      compact={compact}
      user={user}
      intl={intl}
      normalizeEmojiName={normalizeEmojiName}
      meeting={meeting}
      isMeetingLocked={isMeetingLocked}
      getScrollContainerRef={getScrollContainerRef}
      assignPresenter={assignPresenter}
      removeUser={removeUser}
      toggleVoice={toggleVoice}
      changeRole={changeRole}
      setEmojiStatus={setEmojiStatus}
      currentUser={currentUser}
      router={router}
      isBreakoutRoom={isBreakoutRoom}
      getAvailableActions={getAvailableActions}
      handleEmojiChange={handleEmojiChange}
      getEmojiList={getEmojiList}
      getEmoji={getEmoji}
    />);

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
