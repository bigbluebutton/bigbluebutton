import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import UserListContent from './user-list-content/component';
import UserAction from './user-action/component';

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

  compact: PropTypes.bool.isRequired,
  intl: PropTypes.object.isRequired,
  userActions: PropTypes.object.isRequired,
  router: PropTypes.object.isRequired,
  isBreakoutRoom: PropTypes.bool.isRequired,
  getAvailableActions: PropTypes.func.isRequired,
};

const defaultProps = {
  shouldShowActions: false,
  isBreakoutRoom: false,
};

class UserListItem extends Component {

  static createAction(action, ...options) {
    return (
      <UserAction
        key={_.uniqueId('action-item-')}
        icon={action.icon}
        label={action.label}
        handler={action.handler}
        options={[...options]}
      />
    );
  }
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
      (allowedToChatPrivately ? UserListItem.createAction(openChat, router, user) : null),
      (allowedToMuteAudio ? UserListItem.createAction(unmute, user) : null),
      (allowedToUnmuteAudio ? UserListItem.createAction(mute, user) : null),
      (allowedToResetStatus ? UserListItem.createAction(clearStatus, user) : null),
      (allowedToSetPresenter ? UserListItem.createAction(setPresenter, user) : null),
      (allowedToKick ? UserListItem.createAction(kick, user) : null),
    ]);
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
