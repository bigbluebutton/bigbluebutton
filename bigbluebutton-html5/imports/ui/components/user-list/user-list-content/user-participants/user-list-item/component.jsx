import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
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
    let icon = action.icon;
    if (action.icon === 'audio_on') icon = 'unmute';
    if (action.icon === 'audio_off') icon = 'mute';

    return (
      <UserAction
        key={_.uniqueId('action-item-')}
        icon={icon}
        label={action.label(...options)}
        handler={action.handler}
        options={[...options]}
      />
    );
  }

  constructor() {
    super();

    this.state = {
      emojisOpen: false,
      menuShouldClose: false,
    };

    this.closeEmojiMenu = this.closeEmojiMenu.bind(this);
    this.shouldCloseToggle = this.shouldCloseToggle.bind(this);
  }

  shouldCloseToggle() {
    this.setState({ menuShouldClose: false });
  }

  closeEmojiMenu() {
    this.setState({ emojisOpen: false });
  }

  getUsersActions() {
    const {
      currentUser,
      user,
      userActions,
      router,
      isBreakoutRoom,
      getAvailableActions,
      handleEmojiChange,
    } = this.props;

    const {
      openChat,
      clearStatus,
      setStatus,
      setPresenter,
      remove,
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
      allowedToRemove,
      allowedToSetPresenter,
      allowedToPromote,
      allowedToDemote,
      allowedToChangeStatus,
    } = actions;

    const setstatus = {
      icon: 'right_arrow',
      label: () => 'Set Status',
      handler: () => this.setState({ emojisOpen: true }),
    };

    const back = {
      icon: 'left_arrow',
      label: () => 'Back',
      handler: () => this.setState({ emojisOpen: false }),
    };

    const away = {
      icon: 'time',
      label: () => 'Away',
      handler: () => {
        handleEmojiChange('away');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    const raisehand = {
      icon: 'hand',
      label: () => 'Raise',
      handler: () => {
        handleEmojiChange('hand');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    const neutral = {
      icon: 'undecided',
      label: () => 'Undecided',
      handler: () => {
        handleEmojiChange('undecided');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    const confused = {
      icon: 'confused',
      label: () => 'Confused',
      handler: () => {
        handleEmojiChange('confused');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    const sad = {
      icon: 'sad',
      label: () => 'Sad',
      handler: () => {
        handleEmojiChange('sad');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    const happy = {
      icon: 'happy',
      label: () => 'Happy',
      handler: () => {
        handleEmojiChange('happy');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    const applause = {
      icon: 'applause',
      label: () => 'Applause',
      handler: () => {
        handleEmojiChange('applause');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    const thumbsUp = {
      icon: 'thumbs_up',
      label: () => 'Thumbs Up',
      handler: () => {
        handleEmojiChange('thumbs_up');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    const thumbsDown = {
      icon: 'thumbs_down',
      label: () => 'Thumbs Down',
      handler: () => {
        handleEmojiChange('thumbs_down');
        this.setState({ emojisOpen: false, menuShouldClose: true });
      },
    };

    if (this.state.emojisOpen) {
      return _.compact([
        (allowedToChangeStatus ? UserListItem.createAction(back, user) : null),
        (<DropdownListSeparator key={_.uniqueId('list-separator-')} />),
        (UserListItem.createAction(away, user)),
        (UserListItem.createAction(raisehand, user)),
        (UserListItem.createAction(neutral, user)),
        (UserListItem.createAction(confused, user)),
        (UserListItem.createAction(sad, user)),
        (UserListItem.createAction(happy, user)),
        (UserListItem.createAction(applause, user)),
        (UserListItem.createAction(thumbsUp, user)),
        (UserListItem.createAction(thumbsDown, user)),
      ]);
    }

    return _.compact([
      (allowedToChangeStatus ? UserListItem.createAction(setstatus, user) : null),
      (allowedToChatPrivately ? UserListItem.createAction(openChat, router, user) : null),
      (allowedToMuteAudio ? UserListItem.createAction(mute, user) : null),
      (allowedToUnmuteAudio ? UserListItem.createAction(unmute, user) : null),
      (allowedToResetStatus && user.emoji.status !== 'none' ? UserListItem.createAction(clearStatus, user) : null),
      (allowedToSetPresenter ? UserListItem.createAction(setPresenter, user) : null),
      (allowedToRemove ? UserListItem.createAction(remove, user) : null),
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
      emojisOpen={this.state.emojisOpen}
      menuShouldClose={this.state.menuShouldClose}
      shouldCloseToggle={this.shouldCloseToggle}
      closeEmojiMenu={this.closeEmojiMenu}
    />);

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
