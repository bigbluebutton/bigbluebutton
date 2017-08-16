import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import UserActions from './user-actions/component';
import UserListContent from './user-list-content/component';
import styles from './styles.scss';

const normalizeEmojiName = (emoji) => {
  const emojisNormalized = {
    agree: 'thumbs_up',
    disagree: 'thumbs_down',
    thumbsUp: 'thumbs_up',
    thumbsDown: 'thumbs_down',
    raiseHand: 'hand',
    away: 'time',
    neutral: 'undecided',
  };

  return emoji in emojisNormalized ? emojisNormalized[emoji] : emoji;
};

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
};

const defaultProps = {
  shouldShowActions: false,
};

class UserListItem extends Component {

  getUsersActions() {
    const {
      currentUser,
      user,
      userActions,
      router,
      isBreakoutRoom,
      getAvailableActions,
    } = this.props;

    const {
      openChat,
      clearStatus,
      setPresenter,
      kick,
      mute,
      unmute,
    } = userActions;

    const actions = getAvailableActions(currentUser, user, router, isBreakoutRoom);

    const {
      allowedToChatPrivately,
      allowedToMuteAudio,
      allowedToUnmuteAudio,
      allowedToResetStatus,
      allowedToKick,
      allowedToSetPresenter } = actions;

    return _.compact([
      (allowedToChatPrivately ? <UserActions action={openChat} options={[router, user]} /> : null),
      (allowedToMuteAudio ? <UserActions action={unmute} options={[user]} /> : null),
      (allowedToUnmuteAudio ? <UserActions action={mute} options={[user]} /> : null),
      (allowedToResetStatus ? <UserActions action={clearStatus} options={[user]} /> : null),
      (allowedToSetPresenter ? <UserActions action={setPresenter} options={[user]} /> : null),
      (allowedToKick ? <UserActions action={kick} options={[router, user]} /> : null),
    ]);
  }

  getDropdownMenuParent() {
    return findDOMNode(this.dropdown);
  }

  render() {
    const {
      compact,
      user,
      intl,
    } = this.props;

    const actions = this.getUsersActions();

    const contents = (<UserListContent
      compact={compact}
      user={user}
      intl={intl}
      normalizeEmojiName={normalizeEmojiName}
      actions={actions}
    />);

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
