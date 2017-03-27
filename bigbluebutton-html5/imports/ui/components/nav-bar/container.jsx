import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import userListService from '../user-list/service';
import ChatService from '../chat/service';
import Service from './service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import LocalStorage from '/imports/ui/services/storage/local.js';
import NavBar from './component';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

class NavBarContainer extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    LocalStorage.removeItem('bbb.toggleUserList.isExpanded');
  }

  render() {
    return (
      <NavBar {...this.props}>
        {this.props.children}
      </NavBar>
    );
  }
}

export default withRouter(createContainer(({ location, router }) => {

  let toggleState = LocalStorage.getItem('bbb.toggleUserList.isExpanded');
  let isExpanded = (!toggleState) ? false : toggleState;

  const setToggleState = (state) => {
    LocalStorage.setItem('bbb.toggleUserList.isExpanded', state);
  };

  let meetingTitle;
  let meetingRecorded;

  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId: meetingId,
  });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingName;
    meetingRecorded = meetingObject.currentlyBeingRecorded;
  }

  const checkUnreadMessages = () => {
    let users = userListService.getUsers();

    // 1.map every user id
    // 2.filter the user except the current user from the user array
    // 3.add the public chat to the array
    // 4.check current user has unread messages or not.
    return users
      .map(user => user.id)
      .filter(userID => userID !== Auth.userID)
      .concat(PUBLIC_CHAT_KEY)
      .some(receiverID => ChatService.hasUnreadMessages(receiverID));
  };

  const breakouts = Service.getBreakouts();
  const currentUserId = Auth.userID;

  return {
    setToggleState,
    isExpanded,
    breakouts,
    currentUserId,
    meetingId,
    getBreakoutJoinURL: Service.getBreakoutJoinURL,
    presentationTitle: meetingTitle,
    hasUnreadMessages: checkUnreadMessages(),
    isBreakoutRoom: meetingIsBreakout(),
    beingRecorded: meetingRecorded,
    toggleUserList: () => {
      if (location.pathname.indexOf('/users') !== -1) {
        router.push('/');
      } else {
        router.push('/users');
      }
    },
  };
}, NavBarContainer));
