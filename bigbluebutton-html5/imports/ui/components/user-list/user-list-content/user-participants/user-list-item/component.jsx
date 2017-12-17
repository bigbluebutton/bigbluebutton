import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import UserListContent from './user-list-content/component';
import UserAction from './user-action/component';

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
  userActions: PropTypes.shape({}).isRequired,
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
  static createAction(action, ...options) {
    return (
      <UserAction
        key={_.uniqueId('action-item-')}
        icon={action.icon}
        label={action.label(...options)}
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
      promote,
      demote,
    } = userActions;

    const actions = getAvailableActions(currentUser, user, router, isBreakoutRoom);

    const {
      allowedToChatPrivately,
      allowedToMuteAudio,
      allowedToUnmuteAudio,
      allowedToResetStatus,
      allowedToKick,
      allowedToSetPresenter,
      allowedToPromote,
      allowedToDemote,
    } = actions;

    return _.compact([
      (allowedToChatPrivately ? UserListItem.createAction(openChat, router, user) : null),
      (allowedToMuteAudio ? UserListItem.createAction(mute, user) : null),
      (allowedToUnmuteAudio ? UserListItem.createAction(unmute, user) : null),
      (allowedToResetStatus ? UserListItem.createAction(clearStatus, user) : null),
      (allowedToSetPresenter ? UserListItem.createAction(setPresenter, user) : null),
      (allowedToKick ? UserListItem.createAction(kick, user) : null),
      (allowedToPromote ? UserListItem.createAction(promote, user) : null),
      (allowedToDemote ? UserListItem.createAction(demote, user) : null),
    ]);
  }

  render() {
    const {
      compact,
      user,
      intl,
      meeting,
      isMeetingLocked,
      normalizeEmojiName,
      getScrollContainerRef,
    } = this.props;

    const actions = this.getUsersActions();

    const contents = (<UserListContent
      compact={compact}
      user={user}
      intl={intl}
      normalizeEmojiName={normalizeEmojiName}
      actions={actions}
      meeting={meeting}
      isMeetingLocked={isMeetingLocked}
      getScrollContainerRef={getScrollContainerRef}
    />);

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
