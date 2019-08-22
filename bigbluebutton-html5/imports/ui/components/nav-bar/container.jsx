import React from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Meetings from '/imports/api/meetings';
import Users from '/imports/api/users';
import Auth from '/imports/ui/services/auth';
import { meetingIsBreakout } from '/imports/ui/components/app/service';
import getFromUserSettings from '/imports/ui/services/users-settings';
import userListService from '../user-list/service';
import Service from './service';
import NavBar from './component';

const PUBLIC_CONFIG = Meteor.settings.public;
const ROLE_MODERATOR = PUBLIC_CONFIG.user.role_moderator;
const NavBarContainer = ({ children, ...props }) => (
  <NavBar {...props}>
    {children}
  </NavBar>
);

export default withTracker(() => {
  const CLIENT_TITLE = getFromUserSettings('clientTitle', PUBLIC_CONFIG.app.clientTitle);

  let meetingTitle;
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  }, { fields: { 'meetingProp.name': 1 } });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    document.title = `${CLIENT_TITLE} - ${meetingTitle}`;
  }

  const checkUnreadMessages = () => {
    const activeChats = userListService.getActiveChats();
    const hasUnreadMessages = activeChats
      .filter(chat => chat.id !== Session.get('idChatOpen'))
      .some(chat => chat.unreadCounter > 0);
    return hasUnreadMessages;
  };

  const currentUserId = Auth.userID;
  const { connectRecordingObserver, processOutsideToggleRecording } = Service;
  const currentUser = Users.findOne({ userId: Auth.userID }, { fields: { role: 1 } });
  const openPanel = Session.get('openPanel');
  const isExpanded = openPanel !== '';
  const amIModerator = currentUser.role === ROLE_MODERATOR;
  const isBreakoutRoom = meetingIsBreakout();
  const hasUnreadMessages = checkUnreadMessages();

  return {
    amIModerator,
    isExpanded,
    currentUserId,
    processOutsideToggleRecording,
    connectRecordingObserver,
    meetingId,
    presentationTitle: meetingTitle,
    hasUnreadMessages,
    isBreakoutRoom,
  };
})(NavBarContainer);
