import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import _ from 'lodash';
import UserListItemContainer from './user-list-item/container';
import UserOptionsContainer from './user-options/container';

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  meeting: PropTypes.shape({}).isRequired,
  users: PropTypes.arrayOf(PropTypes.string).isRequired,
  getGroupChatPrivate: PropTypes.func.isRequired,
  handleEmojiChange: PropTypes.func.isRequired,
  getUsersId: PropTypes.func.isRequired,
  isBreakoutRoom: PropTypes.bool,
  setEmojiStatus: PropTypes.func.isRequired,
  assignPresenter: PropTypes.func.isRequired,
  removeUser: PropTypes.func.isRequired,
  toggleVoice: PropTypes.func.isRequired,
  muteAllUsers: PropTypes.func.isRequired,
  muteAllExceptPresenter: PropTypes.func.isRequired,
  changeRole: PropTypes.func.isRequired,
  getAvailableActions: PropTypes.func.isRequired,
  normalizeEmojiName: PropTypes.func.isRequired,
  isMeetingLocked: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  toggleUserLock: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
};

const listTransition = {
  enter: styles.enter,
  enterActive: styles.enterActive,
  appear: styles.appear,
  appearActive: styles.appearActive,
  leave: styles.leave,
  leaveActive: styles.leaveActive,
};

const intlMessages = defineMessages({
  usersTitle: {
    id: 'app.userList.usersTitle',
    description: 'Title for the Header',
  },
});

class UserParticipants extends Component {
  constructor() {
    super();

    this.state = {
      index: -1,
    };

    this.userRefs = [];
    this.selectedIndex = -1;

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.focusUserItem = this.focusUserItem.bind(this);
    this.changeState = this.changeState.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  componentDidMount() {
    const { compact, roving, users } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        event => roving(
          event,
          users.length,
          this.changeState,
        ),
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isPropsEqual = _.isEqual(this.props, nextProps);
    const isStateEqual = _.isEqual(this.state, nextState);
    return !isPropsEqual || !isStateEqual;
  }

  componentDidUpdate(prevProps, prevState) {
    const { index } = this.state;
    if (index === -1) {
      return;
    }

    if (index !== prevState.index) {
      this.focusUserItem(index);
    }
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  getUsers() {
    const {
      compact,
      isBreakoutRoom,
      currentUser,
      meeting,
      getAvailableActions,
      normalizeEmojiName,
      isMeetingLocked,
      changeRole,
      assignPresenter,
      setEmojiStatus,
      removeUser,
      toggleVoice,
      getGroupChatPrivate,
      handleEmojiChange,
      getEmojiList,
      getEmoji,
      users,
      hasPrivateChatBetweenUsers,
      toggleUserLock,
    } = this.props;

    let index = -1;

    return users.map(u => (
      <CSSTransition
        classNames={listTransition}
        appear
        enter
        exit
        timeout={0}
        component="div"
        className={cx(styles.participantsList)}
        key={u}
      >
        <div ref={(node) => { this.userRefs[index += 1] = node; }}>
          <UserListItemContainer
            {...{
              currentUser,
              compact,
              isBreakoutRoom,
              meeting,
              getAvailableActions,
              normalizeEmojiName,
              isMeetingLocked,
              handleEmojiChange,
              getEmojiList,
              getEmoji,
              setEmojiStatus,
              assignPresenter,
              removeUser,
              toggleVoice,
              changeRole,
              getGroupChatPrivate,
              hasPrivateChatBetweenUsers,
              toggleUserLock,
            }}
            userId={u}
            getScrollContainerRef={this.getScrollContainerRef}
          />
        </div>
      </CSSTransition>
    ));
  }

  focusUserItem(index) {
    if (!this.userRefs[index]) return;

    this.userRefs[index].firstChild.focus();
  }

  changeState(newIndex) {
    this.setState({ index: newIndex });
  }

  render() {
    const {
      intl,
      users,
      compact,
      setEmojiStatus,
      muteAllUsers,
      meeting,
      muteAllExceptPresenter,
      currentUser,
    } = this.props;

    return (
      <div className={styles.userListColumn}>
        {
          !compact
            ? (
              <div className={styles.container}>
                <h2 className={styles.smallTitle}>
                  {intl.formatMessage(intlMessages.usersTitle)}
                  &nbsp;(
                  {users.length}
                  )
                </h2>
                {currentUser.isModerator
                  ? (
                    <UserOptionsContainer {...{
                      users,
                      muteAllUsers,
                      muteAllExceptPresenter,
                      setEmojiStatus,
                      meeting,
                      currentUser,
                    }}
                    />
                  ) : null
                }

              </div>
            )
            : <hr className={styles.separator} />
        }
        <div
          className={styles.scrollableList}
          role="list"
          tabIndex={0}
          ref={(ref) => { this.refScrollContainer = ref; }}
        >
          <div className={styles.list}>
            <TransitionGroup ref={(ref) => { this.refScrollItems = ref; }}>
              {this.getUsers()}
            </TransitionGroup>
            <div className={styles.footer} />
          </div>
        </div>
      </div>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;
