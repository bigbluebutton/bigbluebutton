import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import UserListItem from './user-list-item/component';
import UserOptionsContainer from './user-options/container';

const propTypes = {
  users: PropTypes.arrayOf(Object).isRequired,
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  meeting: PropTypes.shape({}),
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
};

const defaultProps = {
  compact: false,
  isBreakoutRoom: false,
  // This one is kinda tricky, meteor takes sometime to fetch the data and passing down
  // So the first time its create, the meeting comes as null, sending an error to the client.
  meeting: {},
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
    if (!this.props.compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        event => this.props.roving(
          event,
          this.props.users.length,
          this.changeState,
        ),
      );
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.index === -1) {
      return;
    }

    if (this.state.index !== prevState.index) {
      this.focusUserItem(this.state.index);
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
      users,
      changeRole,
      assignPresenter,
      setEmojiStatus,
      removeUser,
      toggleVoice,
      getGroupChatPrivate, // // TODO check if this is used
      handleEmojiChange, // // TODO add to props validation
      getEmojiList,
      getEmoji,
    } = this.props;

    let index = -1;

    return users.map(user => (
      <CSSTransition
        classNames={listTransition}
        appear
        enter
        exit
        timeout={0}
        component="div"
        className={cx(styles.participantsList)}
        key={user.id}
      >
        <div ref={(node) => { this.userRefs[index += 1] = node; }}>
          <UserListItem
            {...{
              user,
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
            }}
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
      intl, users, compact, setEmojiStatus, muteAllUsers, meeting, muteAllExceptPresenter,
    } = this.props;

    return (
      <div>
        {
          !compact ?
            <div className={styles.container}>
              <h2 className={styles.smallTitle}>
                {intl.formatMessage(intlMessages.usersTitle)}
                &nbsp;({users.length})

              </h2>
              <UserOptionsContainer {...{
                users,
                muteAllUsers,
                muteAllExceptPresenter,
                setEmojiStatus,
                meeting,
              }}
              />
            </div>
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
