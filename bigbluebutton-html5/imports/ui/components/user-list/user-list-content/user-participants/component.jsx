import React, { Component } from 'react';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
import {
  List,
  AutoSizer,
  CellMeasurer,
  CellMeasurerCache,
} from 'react-virtualized';
import UserListItemContainer from './user-list-item/container';
import UserOptionsContainer from './user-options/container';

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired,
  users: PropTypes.arrayOf(PropTypes.shape({})).isRequired,
  setEmojiStatus: PropTypes.func.isRequired,
  roving: PropTypes.func.isRequired,
  requestUserInformation: PropTypes.func.isRequired,
};

const defaultProps = {
  compact: false,
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

const ROLE_MODERATOR = Meteor.settings.public.user.role_moderator;

class UserParticipants extends Component {
  constructor() {
    super();

    this.cache = new CellMeasurerCache({
      fixedWidth: true,
      keyMapper: () => 1,
    });

    this.state = {
      selectedUser: null,
      isOpen: false,
      scrollArea: false,
    };

    this.userRefs = [];

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.rove = this.rove.bind(this);
    this.changeState = this.changeState.bind(this);
    this.rowRenderer = this.rowRenderer.bind(this);
    this.handleClickSelectedUser = this.handleClickSelectedUser.bind(this);
  }

  componentDidMount() {
    const { compact } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        this.rove,
      );

      this.refScrollContainer.addEventListener(
        'click',
        this.handleClickSelectedUser,
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isPropsEqual = _.isEqual(this.props, nextProps);
    const isStateEqual = _.isEqual(this.state, nextState);
    return !isPropsEqual || !isStateEqual;
  }

  componentDidUpdate(prevProps, prevState) {
    const { compact } = this.props;
    const { selectedUser,  scrollArea } = this.state;
    if (!compact && (!prevState.scrollArea && scrollArea)) {
      scrollArea.addEventListener(
        'keydown',
        this.rove,
      );
    }

    if (selectedUser) {
      const { firstChild } = selectedUser;
      if (!firstChild.isEqualNode(document.activeElement)) {
        firstChild.focus();
      }
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
    this.refScrollContainer.removeEventListener('click', this.handleClickSelectedUser);
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  rowRenderer({
    index,
    parent,
    style,
    key,
  }) {
    const {
      compact,
      setEmojiStatus,
      users,
      requestUserInformation,
      currentUser,
      meetingIsBreakout,
    } = this.props;
    const { scrollArea } = this.state;
    const user = users[index];

    return (
      <CellMeasurer
        key={key}
        cache={this.cache}
        columnIndex={0}
        parent={parent}
        rowIndex={index}
      >
        <span
          style={style}
          key={key}
          id={`user-${user.userId}`}
        >
          <UserListItemContainer
            {...{
              compact,
              setEmojiStatus,
              requestUserInformation,
              currentUser,
              meetingIsBreakout,
              scrollArea,
            }}
            user={user}
            getScrollContainerRef={this.getScrollContainerRef}
          />
        </span>
      </CellMeasurer>
    );
  }

  handleClickSelectedUser(event) {
    let selectedUser = null;
    if (event.path) {
      selectedUser = event.path.find(p => p.className && p.className.includes('participantsList'));
    }
    this.setState({ selectedUser });
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedUser, scrollArea } = this.state;
    const usersItemsRef = findDOMNode(scrollArea.firstChild);

    roving(event, this.changeState, usersItemsRef, selectedUser);
  }

  changeState(ref) {
    this.setState({ selectedUser: ref });
  }

  render() {
    const {
      intl,
      users,
      compact,
      setEmojiStatus,
      currentUser,
      meetingIsBreakout,
    } = this.props;
    const { isOpen, scrollArea } = this.state;

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
                {currentUser.role === ROLE_MODERATOR
                  ? (
                    <UserOptionsContainer {...{
                      users,
                      setEmojiStatus,
                      meetingIsBreakout,
                    }}
                    />
                  ) : null
                }

              </div>
            )
            : <hr className={styles.separator} />
        }
        <div
          className={styles.virtulizedScrollableList}
          tabIndex={0}
          ref={(ref) => {
            this.refScrollContainer = ref;
          }}
        >
          <span id="destination" />
          <AutoSizer>
            {({ height, width }) => (
              <List
                {...{
                  isOpen,
                  users,
                }}
                ref={(ref) => {
                  if (ref !== null) {
                    this.listRef = ref;
                  }

                  if (ref !== null && !scrollArea) {                    
                    this.setState({ scrollArea: findDOMNode(ref) });
                  }
                }}
                rowHeight={this.cache.rowHeight}
                rowRenderer={this.rowRenderer}
                rowCount={users.length}
                height={height - 1}
                width={width - 1}
                className={styles.scrollStyle}
                overscanRowCount={30}
                deferredMeasurementCache={this.cache}
              />
            )}
          </AutoSizer>
        </div>
      </div>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;
