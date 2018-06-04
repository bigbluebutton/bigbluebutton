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
import DropdownListSeparator from '/imports/ui/components/dropdown/list/separator/component';
import DropdownListTitle from '/imports/ui/components/dropdown/list/title/component';
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
});

const propTypes = {
  compact: PropTypes.bool.isRequired,
  user: PropTypes.shape({}).isRequired,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  actions: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  meeting: PropTypes.shape({}).isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  getScrollContainerRef: PropTypes.func.isRequired,
  setDropdownOpenState: PropTypes.func.isRequired,
};


class UserListContent extends Component {
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
    };

    this.handleScroll = this.handleScroll.bind(this);
    this.onActionsShow = this.onActionsShow.bind(this);
    this.onActionsHide = this.onActionsHide.bind(this);
    this.getDropdownMenuParent = this.getDropdownMenuParent.bind(this);
  }

  componentWillMount() {
    this.title = _.uniqueId('dropdown-title-');
    this.seperator = _.uniqueId('action-separator-');
  }

  componentDidUpdate() {
    this.checkDropdownDirection();
  }

  onActionsShow() {
    const dropdown = this.getDropdownMenuParent();
    const scrollContainer = this.props.getScrollContainerRef();
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
    this.props.setDropdownOpenState(true);
  }

  onActionsHide() {
    this.setState({
      isActionsOpen: false,
      dropdownVisible: false,
    });

    const scrollContainer = this.props.getScrollContainerRef();
    scrollContainer.removeEventListener('scroll', this.handleScroll, false);

    // prevents User-item menu items from not being able to trigger.
    setTimeout(() => {
      this.props.setDropdownOpenState(false)
    });
  }

  getDropdownMenuParent() {
    return findDOMNode(this.dropdown);
  }

  handleScroll() {
    this.setState({
      isActionsOpen: false,
    });
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
        UserListContent.checkIfDropdownIsVisible(
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

  render() {
    const {
      compact,
      user,
      intl,
      normalizeEmojiName,
      actions,
      isMeetingLocked,
      meeting,
    } = this.props;

    const {
      isActionsOpen,
      dropdownVisible,
      dropdownDirection,
      dropdownOffset,
    } = this.state;

    const userItemContentsStyle = {};

    userItemContentsStyle[styles.userItemContentsCompact] = compact;
    userItemContentsStyle[styles.dropdown] = true;
    userItemContentsStyle[styles.userListItem] = !this.state.isActionsOpen;
    userItemContentsStyle[styles.usertListItemWithMenu] = this.state.isActionsOpen;

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
            <UserAvatar
              moderator={user.isModerator}
              presenter={user.isPresenter}
              talking={user.isTalking}
              muted={user.isMuted}
              listenOnly={user.isListenOnly}
              voice={user.isVoiceUser}
              color={user.color}
            >
              {user.emoji.status !== 'none' ?
                <Icon iconName={normalizeEmojiName(user.emoji.status)} /> :
                user.name.toLowerCase().slice(0, 2)}
            </UserAvatar>
          </div>
          {<UserName
            user={user}
            compact={compact}
            intl={intl}
            meeting={meeting}
            isMeetingLocked={isMeetingLocked}
            userAriaLabel={userAriaLabel}
            isActionsOpen={isActionsOpen}
          />}
          {<UserIcons
            user={user}
            compact={compact}
          />}
        </div>
      </div>
    );

    if (!actions.length) {
      return contents;
    }

    return (
      <Dropdown
        ref={(ref) => { this.dropdown = ref; }}
        isOpen={this.state.isActionsOpen}
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
            {
              [
                (
                  <DropdownListTitle
                    description={intl.formatMessage(messages.menuTitleContext)}
                    key={this.title}
                  >
                    {user.name}
                  </DropdownListTitle>),
                (<DropdownListSeparator key={this.seperator} />),
              ].concat(actions)
            }
          </DropdownList>
        </DropdownContent>
      </Dropdown>
    );
  }
}

UserListContent.propTypes = propTypes;
export default UserListContent;
