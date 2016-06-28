import React, { Component } from 'react';
import UserAvatar from '../../user-avatar/component';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Icon from '../../icon/component';
import UserActions from './user-actions/component';
import { findDOMNode } from 'react-dom';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles.scss';
import { Link } from 'react-router';
import classNames from 'classnames/bind';
let cx = classNames.bind(styles);

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
      visibleActions: false,
    };

    this.handleToggleActions = this.handleToggleActions.bind(this);
    this.handleClickOutsideDropdown = this.handleClickOutsideDropdown.bind(this);
  }

  handleClickOutsideDropdown(e) {
    const node = findDOMNode(this);

    if (e.target !== node && !node.contains(e.target)) {
      this.setState({ visibleActions: false });
    }
  }

  handleToggleActions() {
    this.setState({ visibleActions: !this.state.visibleActions });
  }

  render() {
    let user = this.props.user;
    let currentUser = this.props.currentUser;

    return (
      <li tabIndex='0'
          onClick={this.handleToggleActions.bind(this, user)}
          className={styles.userListItem} {...this.props}>
        <div className={styles.userItemContents}>
          <UserAvatar user={this.props.user}/>
          {this.renderUserName()}
          {this.renderUserIcons()}
        </div>
        <ReactCSSTransitionGroup
          transitionName={userActionsTransition}
          transitionAppear={true}
          transitionEnter={true}
          transitionLeave={true}
          transitionAppearTimeout={0}
          transitionEnterTimeout={0}
          transitionLeaveTimeout={0}
        >
          {this.state.visibleActions ?
              <UserActions
                user={user}
                currentUser={currentUser}
                userActions={this.props.userActions}/> :
              null}
        </ReactCSSTransitionGroup>
      </li>
    );
  }

  renderUserName() {
    const {
      user,
      intl,
    } = this.props;

    let userNameSub = [];
    if (user.isPresenter) {
      userNameSub.push(intl.formatMessage(messages.presenter));
    }

    if (user.isCurrent) {
      userNameSub.push(`(${intl.formatMessage(messages.you)})`);
    }

    userNameSub = userNameSub.join(' ');

    return (
      <ReactCSSTransitionGroup
        className={styles.userName}
        transitionName={userNameSubTransition}
        transitionAppear={true}
        transitionEnter={true}
        transitionLeave={true}
        transitionAppearTimeout={0}
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}
        component='div'>
        <h3 className={styles.userNameMain}>
          {user.name}
        </h3>
        <p className={styles.userNameSub}>
          {userNameSub}
        </p>
      </ReactCSSTransitionGroup>
    );
  }

  renderUserIcons() {
    let user = this.props.user;

    let audioChatIcon = null;
    if (user.isVoiceUser || user.isListenOnly) {
      if (user.isMuted) {
        audioChatIcon = 'audio-off';
      } else {
        audioChatIcon = user.isListenOnly ? 'listen' : 'audio';
      }
    }

    return (
      <div className={styles.userIcons}>
        <span className={styles.userIconsContainer}>
          {user.isSharingWebcam ? <Icon iconName='video'/> : null}
        </span>
        <span className={styles.userIconsContainer}>
          {user.audioChatIcon ? <Icon iconName={audioChatIcon}/> : null}
        </span>
      </div>
    );
  }
}

UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
