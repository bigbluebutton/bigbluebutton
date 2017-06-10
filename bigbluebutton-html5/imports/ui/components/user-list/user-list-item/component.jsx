import React, { Component } from 'react';
import PropTypes from 'prop-types';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import Icon from '/imports/ui/components/icon/component';
import { findDOMNode } from 'react-dom';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles.scss';
import cx from 'classnames';
import _ from 'lodash';

import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';

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

  userActions: PropTypes.shape(),
};

const defaultProps = {
  shouldShowActions: false,
};

const messages = defineMessages({
  presenter: {
    id: 'app.userlist.presenter',
    description: 'Text for identifying presenter user',
  },
  you: {
    id: 'app.userlist.you',
    description: 'Text for identifying your user',
  },
  locked: {
    id: 'app.userlist.locked',
    description: 'Text for identifying locked user',
  },
  menuTitleContext: {
    id: 'app.userlist.menuTitleContext',
    description: 'adds context to userListItem menu title',
  },
  userAriaLabel: {
    id: 'app.userlist.userAriaLabel',
    description: 'aria label for each user in the userlist',
  }
});

const userActionsTransition = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  appear: styles.appear,
  appearActive: styles.appearActive,
  leave: styles.leave,
  leaveActive: styles.leaveActive,
};

const userNameSubTransition = {
  enter: styles.subUserNameEnter,
  enterActive: styles.subUserNameEnterActive,
  appear: styles.subUserNameAppear,
  appearActive: styles.subUserNameAppearActive,
  leave: styles.subUserNameLeave,
  leaveActive: styles.subUserNameLeaveActive,
};

class UserListItem extends Component {

  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false,
      dropdownOffset: 0,
      dropdownDirection: 'top',
      dropdownVisible: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.getDropdownMenuParent = this.getDropdownMenuParent.bind(this);
  }

  handleScroll() {
    this.setState({
      isActionsOpen: false,
    });
  }

  getAvailableActions() {
    const {
      currentUser,
      user,
      userActions,
      router,
      isBreakoutRoom,
    } = this.props;

    const {
      openChat,
      clearStatus,
      setPresenter,
      kick,
      mute,
      unmute,
    } = userActions;

    const hasAuthority = currentUser.isModerator || user.isCurrent;
    const allowedToChatPrivately = !user.isCurrent;
    const allowedToMuteAudio = hasAuthority && user.isVoiceUser && user.isMuted;
    const allowedToUnmuteAudio = hasAuthority && user.isVoiceUser && !user.isMuted;
    const allowedToResetStatus = hasAuthority && user.emoji.status != 'none';

    // if currentUser is a moderator, allow kicking other users
    const allowedToKick = currentUser.isModerator && !user.isCurrent && !isBreakoutRoom;

    const allowedToSetPresenter =
      (currentUser.isModerator || currentUser.isPresenter) && !user.isPresenter;

    return _.compact([
      (allowedToChatPrivately ? this.renderUserAction(openChat, router, user) : null),
      (allowedToMuteAudio ? this.renderUserAction(unmute, user) : null),
      (allowedToUnmuteAudio ? this.renderUserAction(mute, user) : null),
      (allowedToResetStatus ? this.renderUserAction(clearStatus, user) : null),
      (allowedToSetPresenter ? this.renderUserAction(setPresenter, user) : null),
      (allowedToKick ? this.renderUserAction(kick, user) : null),
    ]);
  }

  componentDidUpdate(prevProps, prevState) {
    this.checkDropdownDirection();
  }

  /**
   * Check if the dropdown is visible, if so, check if should be draw on top or bottom direction.
   */
  checkDropdownDirection() {

    if (this.isDropdownActivedByUser()) {
      const dropdown = findDOMNode(this.dropdown);
      const dropdownTrigger = dropdown.children[0];
      const dropdownContent = dropdown.children[1];

      const scrollContainer = dropdown.parentElement.parentElement;

      const nextState = {
        dropdownVisible: true,
      };

      const isDropdownVisible =
        this.checkIfDropdownIsVisible(dropdownContent.offsetTop, dropdownContent.offsetHeight);

      if (!isDropdownVisible) {
        const offsetPageTop =
          (dropdownTrigger.offsetTop + dropdownTrigger.offsetHeight - scrollContainer.scrollTop);

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
    const list = findDOMNode(this.list);

    if (isActionsOpen, dropdownVisible) {
      for(let i = 0; i < list.children.length; i++){
        if(list.children[i].getAttribute('role') === 'menuitem'){
          list.children[i].focus();
          break;
        }
      }
    }
    
    return isActionsOpen && !dropdownVisible;
  }

  /**
   * Return true if the content fit on the screen, false otherwise.
   *
   * @param {number} contentOffSetTop
   * @param {number} contentOffsetHeight
   * @return True if the content fit on the screen, false otherwise.
   */
  checkIfDropdownIsVisible(contentOffSetTop, contentOffsetHeight) {
    return (contentOffSetTop + contentOffsetHeight) < window.innerHeight;
  }

  onActionsShow() {
    const dropdown = findDOMNode(this.dropdown);
    const scrollContainer = dropdown.parentElement.parentElement;
    const dropdownTrigger = dropdown.children[0];

    this.setState({
      isActionsOpen: true,
      dropdownVisible: false,
      dropdownOffset: dropdownTrigger.offsetTop - scrollContainer.scrollTop,
      dropdownDirection: 'top',
    });

    scrollContainer.addEventListener('scroll', this.handleScroll, false);
  }

  getDropdownMenuParent() {
    return findDOMNode(this.dropdown);
  }

  onActionsHide() {
    this.setState({
      isActionsOpen: false,
      dropdownVisible: false,
    });

    findDOMNode(this).parentElement.removeEventListener('scroll', this.handleScroll, false);
  }

  render() {
    const {
      compact,
    } = this.props;

    const userItemContentsStyle = {};
    userItemContentsStyle[styles.userItemContentsCompact] = compact;
    userItemContentsStyle[styles.active] = this.state.isActionsOpen;

    const {
      user,
      intl,
    } = this.props;

    let you = (user.isCurrent) ? intl.formatMessage(messages.you) : '';

    const presenter = (user.isPresenter)
      ? intl.formatMessage(messages.presenter)
      : '';

    const userAriaLabel = intl.formatMessage(messages.userAriaLabel,
        { 0: user.name,
          1: presenter,
          2: you,
          3: user.emoji.status });
      
    let actions = this.getAvailableActions();
    let contents = (
      <div
        className={cx(styles.userListItem, userItemContentsStyle)}
        aria-label={userAriaLabel}
      >
        <div className={styles.userItemContents} aria-hidden="true">
          <UserAvatar user={user} />
          {this.renderUserName()}
          {this.renderUserIcons()}
        </div>
      </div>
    );

    if (!actions.length) {
      return contents;
    }

    const { dropdownOffset, dropdownDirection, dropdownVisible, } = this.state;

    return (
      <Dropdown
        ref={(ref) => { this.dropdown = ref; }}
        isOpen={this.state.isActionsOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
        className={styles.dropdown}
        autoFocus={false}
        aria-haspopup="true"
        aria-live="assertive"
        aria-relevant="additions">
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
            onActionsHide={this.onActionsHide}>
            {
              [
                (<DropdownListTitle
                  description={intl.formatMessage(messages.menuTitleContext)}
                  key={_.uniqueId('dropdown-list-title')}
                >
                  {user.name}
                </DropdownListTitle>),
                (<DropdownListSeparator key={_.uniqueId('action-separator')} />),
              ].concat(actions)
            }
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }

  renderUserContents() {
    const {
      user,
      intl,
    } = this.props;

    const actions = this.getAvailableActions();
    const contents = (
      <div className={styles.userItemContents}>
        <UserAvatar user={user} />
        {this.renderUserName()}
        {this.renderUserIcons()}
      </div>
    );

    if (!actions.length) {
      return contents;
    }

    const { dropdownOffset, dropdownDirection, dropdownVisible } = this.state;

    return (
      <Dropdown
        ref={(ref) => { this.dropdown = ref; }}
        isOpen={this.state.isActionsOpen}
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
        className={styles.dropdown}
        autoFocus={false}
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

          <DropdownList>
            {
              [
                (<DropdownListTitle
                  description={intl.formatMessage(messages.menuTitleContext)}
                  key={_.uniqueId('dropdown-list-title')}
                >
                  {user.name}
                </DropdownListTitle>),
                (<DropdownListSeparator key={_.uniqueId('action-separator')} />),
              ].concat(actions)
            }
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }

  renderUserName() {
    const {
      user,
      intl,
      compact,
      meeting,
    } = this.props;

    if (compact) {
      return;
    }

    let userNameSub = [];

    if (user.isPresenter) {
      userNameSub.push(intl.formatMessage(messages.presenter));
    }

    if (user.isCurrent) {
      userNameSub.push(`(${intl.formatMessage(messages.you)})`);
    }

    userNameSub = userNameSub.join(' ');

    const { disablePrivateChat,
            disableCam,
            disableMic,
            disablePublicChat } = meeting.roomLockSettings;

    return (
      <div className={styles.userName}>
        <span className={styles.userNameMain}>
          {user.name}
        </span>
        <span className={styles.userNameSub}>
          {userNameSub}
          {(user.isLocked && (disablePrivateChat
            || disableCam
            || disableMic
            || disablePublicChat)) ?
              <span> {(user.isCurrent ? ' | ' : null)}
                <Icon iconName="lock" />
                {intl.formatMessage(messages.locked)}
              </span> : null}
        </span>
      </div>
    );
  }

  renderUserIcons() {
    const {
      user,
      compact,
    } = this.props;

    if (compact) {
      return;
    }

    let audioChatIcon = null;

    if (user.isListenOnly) {
      audioChatIcon = 'listen';
    }

    if (user.isVoiceUser) {
      audioChatIcon = !user.isMuted ? 'unmute' : 'mute';
    }

    const audioIconClassnames = {};

    audioIconClassnames[styles.userIconsContainer] = true;
    audioIconClassnames[styles.userIconGlowing] = user.isTalking;

    if (!audioChatIcon && !user.isSharingWebcam) {
      // Prevent rendering the markup when there is no icon to show
      return;
    }

    return (
      <div className={styles.userIcons}>
        {
          user.isSharingWebcam ?
            <span className={styles.userIconsContainer}>
              <Icon iconName="video" />
            </span>
            : null
        }
        {
          audioChatIcon ?
            <span className={cx(audioIconClassnames)}>
              <Icon iconName={audioChatIcon} />
            </span>
            : null
        }
      </div>
    );
  }

  renderUserAction(action, ...parameters) {
    const {
      currentUser,
      user,
    } = this.props;

    const userAction = (
      <DropdownListItem
        key={_.uniqueId('action-item-')}
        icon={action.icon}
        label={action.label}
        defaultMessage={action.label}
        onClick={action.handler.bind(this, ...parameters)}
        placeInTabOrder
      />
    );

    return userAction;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
