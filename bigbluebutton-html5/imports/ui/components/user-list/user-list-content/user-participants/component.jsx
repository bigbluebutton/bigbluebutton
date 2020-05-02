import React, { Component } from 'react';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import { defineMessages } from 'react-intl';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { styles } from '/imports/ui/components/user-list/user-list-content/styles';
import _ from 'lodash';
import { findDOMNode } from 'react-dom';
import UserListItemContainer from './user-list-item/container';
import UserOptionsContainer from './user-options/container';
import ChannelsService from '/imports/ui/components/channels/service'
import Auth from '/imports/ui/services/auth';

const propTypes = {
  compact: PropTypes.bool,
  intl: PropTypes.shape({
    formatMessage: PropTypes.func.isRequired,
  }).isRequired,
  currentUser: PropTypes.shape({}).isRequired, 
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

    this.state = {
      selectedUser: null,
    };

    this.userRefs = [];

    this.getScrollContainerRef = this.getScrollContainerRef.bind(this);
    this.rove = this.rove.bind(this);
    this.changeState = this.changeState.bind(this);
    this.getUsers = this.getUsers.bind(this);
  }

  componentDidMount() {
    const { compact } = this.props;
    if (!compact) {
      this.refScrollContainer.addEventListener(
        'keydown',
        this.rove,
      );
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const isPropsEqual = _.isEqual(this.props, nextProps);
    const isStateEqual = _.isEqual(this.state, nextState);
    return !isPropsEqual || !isStateEqual;
  }

  componentDidUpdate(prevProps, prevState) {
    const { selectedUser } = this.state;

    if (selectedUser === prevState.selectedUser) return;

    if (selectedUser) {
      const { firstChild } = selectedUser;
      if (firstChild) firstChild.focus();
    }
  }

  componentWillUnmount() {
    this.refScrollContainer.removeEventListener('keydown', this.rove);
  }

  getScrollContainerRef() {
    return this.refScrollContainer;
  }

  getUsers() {
    const {
      compact,
      setEmojiStatus,      
      requestUserInformation,
      currentUser,
      meetingIdentifier,
      allUsersInMeeting,
      breakoutRoomUsers
    } = this.props;

    let index = -1;
    var {} = this.props; 

    //The property "users" holds all the users in master channel. If we are rendering the
    //users under a breakout channel link, then we want to show only the users in the break out channel.
    //Note - the mongo break entry has a a "users" field that holds the users.

    const renderOnlyBreakoutusers =  ChannelsService.validateMeetingIsBreakout(meetingIdentifier);
    const isThisBreakoutRoom =  ChannelsService.validateMeetingIsBreakout(Auth.meetingID);

    console.log("Auth.meetingid: " + Auth.meetingID);
    console.log("isThisBreakoutRoom: " + isThisBreakoutRoom);
    console.log("renderOnlyBreakoutusers: " + renderOnlyBreakoutusers);
    console.log("meetingIdentifier: " + meetingIdentifier);

    var usersToRender = allUsersInMeeting;
    if(!isThisBreakoutRoom && renderOnlyBreakoutusers){
      //usersToRender = allUsersInMeeting.filter(u => isbreakoutRoomUser(meetingIdentifier, u.userId));
      usersToRender = allUsersInMeeting.filter(u => {
        const breakoutUser = breakoutRoomUsers.filter(user => user.userId === u.userId).shift();
        return (breakoutUser != null && breakoutUser != undefined);
      });
    }
    
    return usersToRender.map(u => (
      <CSSTransition
        classNames={listTransition} 
        appear
        enter
        exit
        timeout={0}
        component="div"
        className={cx(styles.participantsList)}
        key={u.userId}
      >
        <div ref={(node) => { this.userRefs[index += 1] = node; }}>
          <UserListItemContainer
            {...{
              compact,
              setEmojiStatus,
              requestUserInformation,
              currentUser
            }}
            user={u}
            getScrollContainerRef={this.getScrollContainerRef}
          />
        </div>
      </CSSTransition>
    ));
  }

  rove(event) {
    const { roving } = this.props;
    const { selectedUser } = this.state;
    const usersItemsRef = findDOMNode(this.refScrollItems);
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
      meetingIdentifier,
    } = this.props;

    return (
      <div className={styles.userListColumn}>
        <div
          className={styles.scrollableList}
          tabIndex={0}
          ref={(ref) => { this.refScrollContainer = ref; }}
        >
          <div className={styles.list}>
            <TransitionGroup ref={(ref) => { this.refScrollItems = ref; }}>
              {this.getUsers()}
            </TransitionGroup>
          </div>
        </div>
      </div>
    );
  }
}

UserParticipants.propTypes = propTypes;
UserParticipants.defaultProps = defaultProps;

export default UserParticipants;
