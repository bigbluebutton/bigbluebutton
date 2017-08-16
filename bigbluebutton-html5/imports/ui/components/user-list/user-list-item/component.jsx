import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import _ from 'lodash';
import UserListContent from './user-list-content/component';

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
      (allowedToChatPrivately ? this.renderUserAction(openChat, router, user) : null),
      (allowedToMuteAudio ? this.renderUserAction(unmute, user) : null),
      (allowedToUnmuteAudio ? this.renderUserAction(mute, user) : null),
      (allowedToResetStatus ? this.renderUserAction(clearStatus, user) : null),
      (allowedToSetPresenter ? this.renderUserAction(setPresenter, user) : null),
      (allowedToKick ? this.renderUserAction(kick, user) : null),
    ]);
  }


  renderUserAction(action, ...parameters) {
    const userAction = (
      <DropdownListItem
        key={_.uniqueId('action-item-')}
        icon={action.icon}
        label={action.label}
        defaultMessage={action.label}
        onClick={action.handler.bind(this, ...parameters)}
      />
    );

    return userAction;
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
