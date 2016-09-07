import React, { Component } from 'react';
import UserAvatar from '/imports/ui/components/user-avatar/component';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import Icon from '/imports/ui/components/icon/component';
import UserActions from './user-actions/component';
import { findDOMNode } from 'react-dom';
import { withRouter } from 'react-router';
import { defineMessages, injectIntl } from 'react-intl';
import styles from './styles.scss';
import cx from 'classnames';

import Button from '/imports/ui/components/button/component';
import Dropdown from '/imports/ui/components/dropdown/component';
import DropdownTrigger from '/imports/ui/components/dropdown/trigger/component';
import DropdownContent from '/imports/ui/components/dropdown/content/component';
import DropdownList from '/imports/ui/components/dropdown/list/component';
import DropdownListItem from '/imports/ui/components/dropdown/list/item/component';
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';

// import Dropdown from '/imports/ui/components/dropdown/dropdown-menu/component';
// import DropdownTrigger from '/imports/ui/components/dropdown/dropdown-trigger/component';
// import DropdownContent from '/imports/ui/components/dropdown/dropdown-content/component';

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
      visibleActions: false,
    };

    this.handleToggleActions = this.handleToggleActions.bind(this);
    this.handleClickOutsideDropdown = this.handleClickOutsideDropdown.bind(this);
  }

  handleClickOutsideDropdown(e) {
    const node = findDOMNode(this);
    const shouldUpdateState = e.target !== node &&
                              !node.contains(e.target) &&
                              this.state.visibleActions;
    if (shouldUpdateState) {
      this.setState({ visibleActions: false });
    }
  }

  handleToggleActions() {
    this.setState({ visibleActions: !this.state.visibleActions });
  }

  render() {
    const {
      user,
    } = this.props;

    const userItemContentsStyle = {};
    userItemContentsStyle[styles.userItemContentsCompact] = this.props.compact;
    let contentPositioning = {
      top: this.state.contentTop,
    };

    // let trigger = (
    //   <DropdownTrigger>
    //       <li className={cx(styles.userListItem, userItemContentsStyle)}>
    //         <div className={styles.userItemContents}>
    //           <UserAvatar user={this.props.user}/>
    //           {this.renderUserName()}
    //           {this.renderUserIcons()}
    //         </div>
    //       </li>
    //   </DropdownTrigger>
    // );

    let onActionsOpen = () => {
      // const dropdown = findDOMNode(this.refs.dropdown);

      // console.log(dropdown.parentElement.offsetTop);
      // console.log(dropdown.offsetTop);
      // console.log(dropdown);

      this.setState({ contentTop: dropdown.offsetTop - dropdown.parentElement.scrollTop });
      this.props.onUserActionsOpen();
    };


    console.log('Kappa');
    return (
      <li className={cx(styles.userListItem, userItemContentsStyle)}>
        <Dropdown ref="dropdown">
          <DropdownTrigger>
           <div className={styles.userItemContents}>
             <UserAvatar user={this.props.user}/>
             {this.renderUserName()}
             {this.renderUserIcons()}
           </div>
          </DropdownTrigger>
          <DropdownContent placement="right top">
            <DropdownList>
              <DropdownListItem
                icon="full-screen"
                label="Fullscreen"
                defaultMessage="Make the application fullscreen"
                onClick={() => {}}
              />
              <DropdownListItem
                icon="more"
                label="Settings"
                description="Change the general settings"
                onClick={() => {}}
              />
              <DropdownListSeparator />
              <DropdownListItem
                icon="logout"
                label="Leave Session"
                description="Leave the meeting"
                onClick={() => {}}
              />
            </DropdownList>
          </DropdownContent>
        </Dropdown>
      </li>
    );

    // <Dropdown
    //   ref='dropdown'
    //   onOpen={onActionsOpen}
    //   onClose={this.props.onUserActionsClose}>
    //     {trigger}
    //   <DropdownContent>
    //     <div
    //       className={styles.triangleOnDropdown}
    //       style={contentPositioning}></div>
    //     <div
    //       className={styles.dropdownActiveContent}
    //       style={contentPositioning}>
    //       {this.renderUserActions()}
    //     </div>
    //   </DropdownContent>
    // </Dropdown>
    // );
  }

  renderUserName() {
    const {
      user,
      intl,
    } = this.props;

    if (this.props.compact) {
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
    } = this.props;

    if (this.props.compact) {
      return;
    }

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
          {audioChatIcon ? <Icon iconName={audioChatIcon}/> : null}
        </span>
      </div>
    );
  }

  renderUserActions() {
    const {
      user,
      currentUser,
      userActions,
    } = this.props;

    return (
      <ReactCSSTransitionGroup
        transitionName={userActionsTransition}
        transitionAppear={true}
        transitionEnter={true}
        transitionLeave={true}
        transitionAppearTimeout={0}
        transitionEnterTimeout={0}
        transitionLeaveTimeout={0}
      >
        <UserActions
          user={user}
          currentUser={currentUser}
          userActions={userActions}/>
      </ReactCSSTransitionGroup>
    );
  }
}

UserListItem.propTypes = propTypes;
UserListItem.defaultProps = defaultProps;

export default withRouter(injectIntl(UserListItem));
