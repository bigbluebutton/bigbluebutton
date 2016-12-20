import React, { Component } from 'react';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Icon from '/imports/ui/components/icon/component';
import { findDOMNode } from 'react-dom';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles.scss';
import cx from 'classnames';
import _ from 'underscore';

import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

const propTypes = {
  user: React.PropTypes.shape({
    name: React.PropTypes.string.isRequired,
    isPresenter: React.PropTypes.bool.isRequired,
    isVoiceUser: React.PropTypes.bool.isRequired,
    isModerator: React.PropTypes.bool.isRequired,
    image: React.PropTypes.string,
  }).isRequired,

  currentUser: React.PropTypes.shape({
    id: React.PropTypes.string.isRequired,
  }).isRequired,

  userActions: React.PropTypes.shape(),
};

const defaultProps = {
  shouldShowActions: false,
};

const messages = defineMessages({
  presenter: {
    id: 'app.userlist.presenter',
    description: 'Text for identifying presenter user',
    defaultMessage: 'Presenter',
  },
  you: {
    id: 'app.userlist.you',
    description: 'Text for identifying your user',
    defaultMessage: 'You',
  },
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
  componentDidMount() {
    const { addEventListener } = window;
    addEventListener('click', this.handleClickOutsideDropdown, false);
  }

  componentWillUnmount() {
    const { removeEventListener } = window;
    removeEventListener('click', this.handleClickOutsideDropdown, false);
  }

  constructor(props) {
    super(props);

    this.state = {
      isActionsOpen: false,
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
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
    } = this.props;

    const {
      openChat,
      clearStatus,
      setPresenter,
      promote,
      kick,
      mute,
      unmute,
    } = userActions;

    let muteAudio, unmuteAudio;

    // Check the state of joining the audio currently for current user
    if (user.isCurrent && user.isVoiceUser) {
      if (user.isMuted) {
        muteAudio = true;
      } else {
        unmuteAudio = true;
      }
    }

    return _.compact([
      (!user.isCurrent ? this.renderUserAction(openChat, router, user) : null),
      (muteAudio ? this.renderUserAction(unmute, user) : null),
      (unmuteAudio ? this.renderUserAction(mute, user) : null),
      (currentUser.isModerator ? this.renderUserAction(clearStatus, user) : null),
      (currentUser.isModerator ? this.renderUserAction(setPresenter, user) : null),
      (currentUser.isModerator ? this.renderUserAction(promote, user) : null),
      (currentUser.isModerator ? this.renderUserAction(kick, user) : null),
    ]);
  }

  onActionsShow() {
    const dropdown = findDOMNode(this.refs.dropdown);
    this.setState({
      contentTop: `${dropdown.offsetTop - dropdown.parentElement.parentElement.scrollTop}px`,
      isActionsOpen: true,
      active: true,
    });

    findDOMNode(this).parentElement.addEventListener('scroll', this.handleScroll, false);
  }

  onActionsHide() {
    this.setState({
      active: false,
      isActionsOpen: false,
    });

    findDOMNode(this).parentElement.removeEventListener('scroll', this.handleScroll, false);
  }

  render() {
    const {
      user,
      currentUser,
      userActions,
      compact,
    } = this.props;

    let userItemContentsStyle = {};
    userItemContentsStyle[styles.userItemContentsCompact] = compact;
    userItemContentsStyle[styles.active] = this.state.active;

    return (
      <li
        className={cx(styles.userListItem, userItemContentsStyle)}>
        {this.renderUserContents()}
      </li>
    );
  }

  renderUserContents() {
    const {
      user,
    } = this.props;

    let actions = this.getAvailableActions();
    let contents = (
      <div tabIndex={0} className={styles.userItemContents}>
        <UserAvatar user={user}/>
        {this.renderUserName()}
        {this.renderUserIcons()}
      </div>
    );

    if (!actions.length) {
      return contents;
    }

    return (
      <Dropdown
        isOpen={this.state.isActionsOpen}
        ref="dropdown"
        onShow={this.onActionsShow}
        onHide={this.onActionsHide}
        className={styles.dropdown}>
        <DropdownTrigger>
          {contents}
        </DropdownTrigger>
        <DropdownContent
          style={{
            top: this.state.contentTop,
          }}
          className={styles.dropdownContent}
          placement="right top">

          <DropdownList>
            {
              [
                (<DropdownListItem
                  className={styles.actionsHeader}
                  key={_.uniqueId('action-header')}
                  label={user.name}
                  style={{ fontWeight: 600 }}
                  defaultMessage={user.name}/>),
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

    return (
      <div className={styles.userName}>
        <h3 className={styles.userNameMain}>
          {user.name}
        </h3>
        <p className={styles.userNameSub}>
          {userNameSub}
        </p>
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
      audioChatIcon = !user.isMuted ? 'audio' : 'audio-off';
    }

    let audioIconClassnames = {};

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
              <Icon iconName='video'/>
            </span>
            : null
        }
        {
          audioChatIcon ?
          <span className={cx(audioIconClassnames)}>
            <Icon iconName={audioChatIcon}/>
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
      <DropdownListItem key={_.uniqueId('action-item-')}
        icon={action.icon}
        label={action.label}
        defaultMessage={action.label}
        onClick={action.handler.bind(this, ...parameters)}
      />
    );

    return userAction;
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
