import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import { defineMessages } from 'react-intl';
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

const intlMessages = defineMessages({
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'label for option to show emoji menu',
  },
  backTriggerLabel: {
    id: 'app.audio.backLabel',
    description: 'label for option to hide emoji menu',
  },
  awayLabel: {
    id: 'app.actionsBar.emojiMenu.awayLabel',
    description: 'label for the away emoji option',
  },
  raiseHandLabel: {
    id: 'app.actionsBar.emojiMenu.raiseHandLabel',
    description: 'label for the raise hand emoji option',
  },
  neutralLabel: {
    id: 'app.actionsBar.emojiMenu.neutralLabel',
    description: 'label for the undecided emoji option',
  },
  confusedLabel: {
    id: 'app.actionsBar.emojiMenu.confusedLabel',
    description: 'label for the confused emoji option',
  },
  sadLabel: {
    id: 'app.actionsBar.emojiMenu.sadLabel',
    description: 'label for the sad emoji option',
  },
  happyLabel: {
    id: 'app.actionsBar.emojiMenu.happyLabel',
    description: 'label for the happy emoji option',
  },
  applauseLabel: {
    id: 'app.actionsBar.emojiMenu.applauseLabel',
    description: 'label for the applause emoji option',
  },
  thumbsUpLabel: {
    id: 'app.actionsBar.emojiMenu.thumbsUpLabel',
    description: 'label for the thumbs up emoji option',
  },
  thumbsDownLabel: {
    id: 'app.actionsBar.emojiMenu.thumbsDownLabel',
    description: 'label for the thumbs down emoji option',
  },
});

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
      showEmojiMenu: false,
      userDropdownOpen: false,
    };

    this.closeEmojiMenu = this.closeEmojiMenu.bind(this);
    this.closeUserDropdown = this.closeUserDropdown.bind(this);
    this.emojiSelected = this.emojiSelected.bind(this);
  }

  closeUserDropdown() {
    this.setState({
      userDropdownOpen: false,
    });
  }

  closeEmojiMenu() {
    this.setState({
      showEmojiMenu: false,
    });
  }

  emojiSelected() {
    this.setState({
      userDropdownOpen: true,
    }, this.closeEmojiMenu());
  }

  getUsersActions() {
    const {
      intl,
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

    const emojiRelatedOptions = {
      setstatus: {
        icon: 'right_arrow',
        label: () => intl.formatMessage(intlMessages.statusTriggerLabel),
        handler: () => this.setState({ showEmojiMenu: true }),
      },
      back: {
        icon: 'left_arrow',
        label: () => intl.formatMessage(intlMessages.backTriggerLabel),
        handler: () => this.setState({ showEmojiMenu: false }),
      },
      away: {
        icon: 'time',
        label: () => intl.formatMessage(intlMessages.awayLabel),
        handler: () => { handleEmojiChange('away'); this.emojiSelected(); },
      },
      raisehand: {
        icon: 'hand',
        label: () => intl.formatMessage(intlMessages.raiseHandLabel),
        handler: () => { handleEmojiChange('hand'); this.emojiSelected(); },
      },
      neutral: {
        icon: 'undecided',
        label: () => intl.formatMessage(intlMessages.neutralLabel),
        handler: () => { handleEmojiChange('undecided'); this.emojiSelected(); },
      },
      confused: {
        icon: 'confused',
        label: () => intl.formatMessage(intlMessages.confusedLabel),
        handler: () => { handleEmojiChange('confused'); this.emojiSelected(); },
      },
      sad: {
        icon: 'sad',
        label: () => intl.formatMessage(intlMessages.sadLabel),
        handler: () => { handleEmojiChange('sad'); this.emojiSelected(); },
      },
      happy: {
        icon: 'happy',
        label: () => intl.formatMessage(intlMessages.happyLabel),
        handler: () => { handleEmojiChange('happy'); this.emojiSelected(); },
      },
      applause: {
        icon: 'applause',
        label: () => intl.formatMessage(intlMessages.applauseLabel),
        handler: () => { handleEmojiChange('applause'); this.emojiSelected(); },
      },
      thumbsUp: {
        icon: 'thumbs_up',
        label: () => intl.formatMessage(intlMessages.thumbsUpLabel),
        handler: () => { handleEmojiChange('thumbs_up'); this.emojiSelected(); },
      },
      thumbsDown: {
        icon: 'thumbs_down',
        label: () => intl.formatMessage(intlMessages.thumbsDownLabel),
        handler: () => { handleEmojiChange('thumbs_down'); this.emojiSelected(); },
      },
    };

    if (this.state.showEmojiMenu) {
      return _.compact([
        (allowedToChangeStatus ? UserListItem.createAction(emojiRelatedOptions.back, user) : null),
        (<DropdownListSeparator key={_.uniqueId('list-separator-')} />),
        (UserListItem.createAction(emojiRelatedOptions.away, user)),
        (UserListItem.createAction(emojiRelatedOptions.raisehand, user)),
        (UserListItem.createAction(emojiRelatedOptions.neutral, user)),
        (UserListItem.createAction(emojiRelatedOptions.confused, user)),
        (UserListItem.createAction(emojiRelatedOptions.sad, user)),
        (UserListItem.createAction(emojiRelatedOptions.happy, user)),
        (UserListItem.createAction(emojiRelatedOptions.applause, user)),
        (UserListItem.createAction(emojiRelatedOptions.thumbsUp, user)),
        (UserListItem.createAction(emojiRelatedOptions.thumbsDown, user)),
      ]);
    }

    return _.compact([
      (allowedToChangeStatus ? UserListItem.createAction(emojiRelatedOptions.setstatus, user) : null),
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
      showEmojiMenu={this.state.showEmojiMenu}
      userDropdownOpen={this.state.userDropdownOpen}
      closeUserDropdown={this.closeUserDropdown}
      closeEmojiMenu={this.closeEmojiMenu}
    />);

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
