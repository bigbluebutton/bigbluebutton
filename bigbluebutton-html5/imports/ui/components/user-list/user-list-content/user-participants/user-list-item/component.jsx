import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router';
import { injectIntl } from 'react-intl';
import _ from 'lodash';
import { defineMessages } from 'react-intl';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import UserListContent from './user-list-content/component';
import UserAction from './user-action/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import { styles } from './styles';

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
});

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
      getEmojiList,
      getEmoji,
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

    const emojiMenuControls = {
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
    };

    if (this.state.showEmojiMenu) {
      const statuses = Object.keys(getEmojiList);
      const options = statuses.map(status => (
        <DropdownListItem
          key={status}
          className={status === getEmoji ? styles.emojiSelected : null}
          icon={getEmojiList[status]}
          label={intl.formatMessage({ id: `app.actionsBar.emojiMenu.${status}Label` })}
          description={intl.formatMessage({ id: `app.actionsBar.emojiMenu.${status}Desc` })}
          onClick={() => { handleEmojiChange(status); this.emojiSelected(); }}
          tabIndex={-1}
        />
      ));

      return _.compact([
        (allowedToChangeStatus ? UserListItem.createAction(emojiMenuControls.back, user) : null),
        (<DropdownListSeparator key={_.uniqueId('list-separator-')} />),
      ]).concat(options);
    }

    return _.compact([
      (allowedToChangeStatus ? UserListItem.createAction(emojiMenuControls.setstatus, user) : null),
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
      emojiSelected={this.emojiSelected}
    />);

    return contents;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
