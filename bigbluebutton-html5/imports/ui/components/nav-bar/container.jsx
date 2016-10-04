import React, { Component, PropTypes } from 'react';
import { createContainer } from 'meteor/react-meteor-data';
import { withRouter } from 'react-router';

import Meetings from '/imports/api/meetings';

import Auth from '/imports/ui/services/auth';
import Service from '../user-list/service';
import ChatService from '../chat/service';

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
    meetingId: meetingId,
  });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingName;
    meetingRecorded = meetingObject.currentlyBeingRecorded;
  }

  const users = Service.getUsers();
  let unreadMessagesFromUsers;
  let unreadMessagesFromPublic = ChatService.hasUnreadMessages(PUBLIC_CHAT_KEY);
  let hasUnreadMessages;

  for (let i = 0; i < users.length; i++) {
    if (users[i].id !== Auth.userID) {
      unreadMessagesFromUsers = ChatService.hasUnreadMessages(users[i].id);
    }
  }

  hasUnreadMessages = unreadMessagesFromPublic || unreadMessagesFromUsers;

  return {
    presentationTitle: meetingTitle,
    hasUnreadMessages: hasUnreadMessages,
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
