import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { findDOMNode } from 'react-dom';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/icon/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import _ from 'lodash';
import { Session } from 'meteor/session';
import { styles } from './styles';
import UserName from './../user-name/component';
import UserIcons from './../user-icons/component';

const messages = defineMessages({
  presenter: {
    id: 'app.userList.presenter',
    description: 'Text for identifying presenter user',
  },
  you: {
    id: 'app.userList.you',
    description: 'Text for identifying your user',
  },
  locked: {
    id: 'app.userList.locked',
    description: 'Text for identifying locked user',
  },
  guest: {
    id: 'app.userList.guest',
    description: 'Text for identifying guest user',
  },
  menuTitleContext: {
    id: 'app.userList.menuTitleContext',
    description: 'adds context to userListItem menu title',
  },
  userAriaLabel: {
    id: 'app.userList.userAriaLabel',
    description: 'aria label for each user in the userlist',
  },
  statusTriggerLabel: {
    id: 'app.actionsBar.emojiMenu.statusTriggerLabel',
    description: 'label for option to show emoji menu',
  },
  backTriggerLabel: {
    id: 'app.audio.backLabel',
    description: 'label for option to hide emoji menu',
  },
  ChatLabel: {
    id: 'app.userList.menu.chat.label',
    description: 'Save the changes and close the settings menu',
  },
  ClearStatusLabel: {
    id: 'app.userList.menu.clearStatus.label',
    description: 'Clear the emoji status of this user',
  },
  MakePresenterLabel: {
    id: 'app.userList.menu.makePresenter.label',
    description: 'Set this user to be the presenter in this meeting',
  },
  RemoveUserLabel: {
    id: 'app.userList.menu.removeUser.label',
    description: 'Forcefully remove this user from the meeting',
  },
  MuteUserAudioLabel: {
    id: 'app.userList.menu.muteUserAudio.label',
    description: 'Forcefully mute this user',
  },
  UnmuteUserAudioLabel: {
    id: 'app.userList.menu.unmuteUserAudio.label',
    description: 'Forcefully unmute this user',
  },
  PromoteUserLabel: {
    id: 'app.userList.menu.promoteUser.label',
    description: 'Forcefully promote this viewer to a moderator',
  },
  DemoteUserLabel: {
    id: 'app.userList.menu.demoteUser.label',
    description: 'Forcefully demote this moderator to a viewer',
  },
});

const propTypes = {
  compact: PropTypes.bool.isRequired,
  user: PropTypes.shape({}).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  meeting: PropTypes.shape({}).isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  getScrollContainerRef: PropTypes.func.isRequired,
};

class UserDropdown extends Component {
  /**
   * Return true if the content fit on the screen, false otherwise.
   *
   * @param {number} contentOffSetTop
   * @param {number} contentOffsetHeight
   * @return True if the content fit on the screen, false otherwise.
   */
  static checkIfDropdownIsVisible(contentOffSetTop, contentOffsetHeight) {
    return (contentOffSetTop + contentOffsetHeight) < window.innerHeight;
  }

  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false,
      dropdownOffset: 0,
      dropdownDirection: 'top',
      dropdownVisible: false,
      showNestedOptions: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.getDropdownMenuParent = this.getDropdownMenuParent.bind(this);
    this.renderUserAvatar = this.renderUserAvatar.bind(this);
    this.resetMenuState = this.resetMenuState.bind(this);
    this.makeDropdownItem = this.makeDropdownItem.bind(this);
  }

  componentWillMount() {
    this.title = _.uniqueId('dropdown-title-');
    this.seperator = _.uniqueId('action-separator-');
  }

  componentDidUpdate(prevProps, prevState) {
    if (!this.state.isActionsOpen && this.state.showNestedOptions) {
      return this.resetMenuState();
    }

    this.checkDropdownDirection();
  }

  makeDropdownItem(key, label, onClick, icon = null, iconRight = null) {
    return (
      <DropdownListItem
        {...{
          key,
          label,
          onClick,
          icon,
          iconRight,
        }}
        className={key === this.props.getEmoji ? styles.emojiSelected : null}
      />
    );
  }

  resetMenuState() {
    return this.setState({
      isActionsOpen: false,
      dropdownOffset: 0,
      dropdownDirection: 'top',
      dropdownVisible: false,
      showNestedOptions: false,
    });
  }

  getUsersActions() {
    const {
      intl,
      currentUser,
      user,
      isBreakoutRoom,
      getAvailableActions,
      getGroupChatPrivate,
      handleEmojiChange,
      getEmojiList,
      setEmojiStatus,
      assignPresenter,
      removeUser,
      toggleVoice,
      changeRole,
    } = this.props;

    const actionPermissions = getAvailableActions(currentUser, user, isBreakoutRoom);
    const actions = [];

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
    } = actionPermissions;

    if (this.state.showNestedOptions) {
      if (allowedToChangeStatus) {
        actions.push(this.makeDropdownItem(
          'back',
          intl.formatMessage(messages.backTriggerLabel),
          () => this.setState({ showNestedOptions: false, isActionsOpen: true }),
          'left_arrow',
        ));
      }

      actions.push(<DropdownListSeparator key={_.uniqueId('list-separator-')} />);

      const statuses = Object.keys(getEmojiList);
      statuses.map(status => actions.push(this.makeDropdownItem(
        status,
        intl.formatMessage({ id: `app.actionsBar.emojiMenu.${status}Label` }),
        () => { handleEmojiChange(status); this.resetMenuState(); },
        getEmojiList[status],
      )));

      return actions;
    }

    if (allowedToChangeStatus) {
      actions.push(this.makeDropdownItem(
        'setstatus',
        intl.formatMessage(messages.statusTriggerLabel),
        () => this.setState({ showNestedOptions: true, isActionsOpen: true }),
        'user',
        'right_arrow',
      ));
    }

    if (allowedToChatPrivately) {
      actions.push(this.makeDropdownItem(
        'openChat',
        intl.formatMessage(messages.ChatLabel),
        () => {
          getGroupChatPrivate(currentUser, user);
          if (Session.equals('isPollOpen', true)) {
            Session.set('isPollOpen', false);
            Session.set('forcePollOpen', true);
          }
          Session.set('idChatOpen', user.id);
          Session.set('isChatOpen', true);
        },
        'chat',
      ));
    }

    if (allowedToResetStatus && user.emoji.status !== 'none') {
      actions.push(this.makeDropdownItem(
        'clearStatus',
        intl.formatMessage(messages.ClearStatusLabel),
        () => this.onActionsHide(setEmojiStatus(user.id, 'none')),
        'clear_status',
      ));
    }

    if (allowedToMuteAudio) {
      actions.push(this.makeDropdownItem(
        'mute',
        intl.formatMessage(messages.MuteUserAudioLabel),
        () => this.onActionsHide(toggleVoice(user.id)),
        'mute',
      ));
    }

    if (allowedToUnmuteAudio) {
      actions.push(this.makeDropdownItem(
        'unmute',
        intl.formatMessage(messages.UnmuteUserAudioLabel),
        () => this.onActionsHide(toggleVoice(user.id)),
        'unmute',
      ));
    }

    if (allowedToSetPresenter) {
      actions.push(this.makeDropdownItem(
        'setPresenter',
        intl.formatMessage(messages.MakePresenterLabel),
        () => this.onActionsHide(assignPresenter(user.id)),
        'presentation',
      ));
    }

    if (allowedToRemove) {
      actions.push(this.makeDropdownItem(
        'remove',
        intl.formatMessage(messages.RemoveUserLabel, { 0: user.name }),
        () => this.onActionsHide(removeUser(user.id)),
        'circle_close',
      ));
    }

    if (allowedToPromote) {
      actions.push(this.makeDropdownItem(
        'promote',
        intl.formatMessage(messages.PromoteUserLabel),
        () => this.onActionsHide(changeRole(user.id, 'MODERATOR')),
        'promote',
      ));
    }

    if (allowedToDemote) {
      actions.push(this.makeDropdownItem(
        'demote',
        intl.formatMessage(messages.DemoteUserLabel),
        () => this.onActionsHide(changeRole(user.id, 'VIEWER')),
        'user',
      ));
    }

    return actions;
  }

  onActionsShow() {
    const dropdown = this.getDropdownMenuParent();
    const scrollContainer = this.props.getScrollContainerRef();

    if (dropdown && scrollContainer) {
      const dropdownTrigger = dropdown.children[0];
      const list = findDOMNode(this.list);
      const children = [].slice.call(list.children);
      children.find(child => child.getAttribute('role') === 'menuitem').focus();

      this.setState({
        isActionsOpen: true,
        dropdownVisible: false,
        dropdownOffset: dropdownTrigger.offsetTop - scrollContainer.scrollTop,
        dropdownDirection: 'top',
      });

      scrollContainer.addEventListener('scroll', this.handleScroll, false);
    }
  }

  onActionsHide(callback) {
    this.setState({
      isActionsOpen: false,
      dropdownVisible: false,
    });

    const scrollContainer = this.props.getScrollContainerRef();
    scrollContainer.removeEventListener('scroll', this.handleScroll, false);

    if (callback) {
      return callback;
    }
  }

  getDropdownMenuParent() {
    return findDOMNode(this.dropdown);
  }

  handleScroll() {
    this.setState({ isActionsOpen: false });
  }

  /**
   * Check if the dropdown is visible, if so, check if should be draw on top or bottom direction.
   */
  checkDropdownDirection() {
    if (this.isDropdownActivedByUser()) {
      const dropdown = this.getDropdownMenuParent();
      const dropdownTrigger = dropdown.children[0];
      const dropdownContent = dropdown.children[1];

      const scrollContainer = this.props.getScrollContainerRef();

      const nextState = {
        dropdownVisible: true,
      };

      const isDropdownVisible =
        UserDropdown.checkIfDropdownIsVisible(
          dropdownContent.offsetTop,
          dropdownContent.offsetHeight,
        );

      if (!isDropdownVisible) {
        const offsetPageTop =
          ((dropdownTrigger.offsetTop + dropdownTrigger.offsetHeight) - scrollContainer.scrollTop);

        nextState.dropdownOffset = window.innerHeight - offsetPageTop;
        nextState.dropdownDirection = 'bottom';
      }

      this.setState(nextState);
    }
  }

  /**
  * Check if the dropdown is visible and is opened by the user
  *
  * @return True if is visible and opened by the user.
  */
  isDropdownActivedByUser() {
    const { isActionsOpen, dropdownVisible } = this.state;

    return isActionsOpen && !dropdownVisible;
  }

  renderUserAvatar() {
    const {
      normalizeEmojiName,
      user,
    } = this.props;

    const { clientType } = user;
    const isVoiceOnly = clientType === 'dial-in-user';

    const iconUser = user.emoji.status !== 'none' ?
      (<Icon iconName={normalizeEmojiName(user.emoji.status)} />) :
      user.name.toLowerCase().slice(0, 2);

    const iconVoiceOnlyUser = (<Icon iconName="speak_louder" />);

    return (
      <UserAvatar
        moderator={user.isModerator}
        presenter={user.isPresenter}
        talking={user.isTalking}
        muted={user.isMuted}
        listenOnly={user.isListenOnly}
        voice={user.isVoiceUser}
        color={user.color}
      >
        {isVoiceOnly ? iconVoiceOnlyUser : iconUser }
      </UserAvatar>
    );
  }

  render() {
    const {
      compact,
      user,
      intl,
      isMeetingLocked,
      meeting,
    } = this.props;

    const {
      isActionsOpen,
      dropdownVisible,
      dropdownDirection,
      dropdownOffset,
      showNestedOptions,
    } = this.state;

    const actions = this.getUsersActions();

    const userItemContentsStyle = {};

    userItemContentsStyle[styles.userItemContentsCompact] = compact;
    userItemContentsStyle[styles.dropdown] = true;
    userItemContentsStyle[styles.userListItem] = !isActionsOpen;
    userItemContentsStyle[styles.usertListItemWithMenu] = isActionsOpen;

    const you = (user.isCurrent) ? intl.formatMessage(messages.you) : '';

    const presenter = (user.isPresenter)
      ? intl.formatMessage(messages.presenter)
      : '';

    const userAriaLabel = intl.formatMessage(
      messages.userAriaLabel,
      {
        0: user.name,
        1: presenter,
        2: you,
        3: user.emoji.status,
      },
    );

    const contents = (
      <div
        className={!actions.length ? styles.userListItem : null}
      >
        <div className={styles.userItemContents}>
          <div className={styles.userAvatar}>
            { this.renderUserAvatar() }
          </div>
          {<UserName
            {...{
              user,
              compact,
              intl,
              meeting,
              isMeetingLocked,
              userAriaLabel,
              isActionsOpen,
            }}
          />}
          {<UserIcons
            {...{
              user,
              compact,
            }}
          />}
        </div>
      </div>
    );

    if (!actions.length) return contents;

    return (
      <Dropdown
        ref={(ref) => { this.dropdown = ref; }}
        keepOpen={isActionsOpen || showNestedOptions}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
        className={userItemContentsStyle}
        autoFocus={false}
        aria-haspopup="true"
        aria-live="assertive"
        aria-relevant="additions"
      >
        <DropdownTrigger>
          {contents}
        </DropdownTrigger>
        <DropdownContent
          style={{
            visibility: dropdownVisible ? 'visible' : 'hidden',
            [dropdownDirection]: `${dropdownOffset}px`,
          }}
          className={styles.dropdownContent}
          placement={`right ${dropdownDirection}`}
        >
          <DropdownList
            ref={(ref) => { this.list = ref; }}
            getDropdownMenuParent={this.getDropdownMenuParent}
            onActionsHide={this.onActionsHide}
          >
            {actions}
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

UserDropdown.propTypes = propTypes;
export default UserDropdown;
