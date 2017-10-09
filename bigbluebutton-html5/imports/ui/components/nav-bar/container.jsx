import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';
import Meetings from '/imports/api/2.0/meetings';
import Auth from '/imports/ui/services/auth';
import userListService from '../user-list/service';
import ChatService from '../chat/service';
import Service from './service';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import NavBar from './component';

const CHAT_CONFIG = Meteor.settings.public.chat;
const PUBLIC_CHAT_KEY = CHAT_CONFIG.public_id;

class NavBarContainer extends Component {
  constructor(props) {
    super(props);
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
  let meetingTitle;
  let meetingRecorded;

  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    meetingRecorded = meetingObject.currentlyBeingRecorded;
  }

  const checkUnreadMessages = () => {
    const users = userListService.getUsers();

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

  const isExpanded = location.pathname.indexOf('/users') !== -1;

  return {
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
