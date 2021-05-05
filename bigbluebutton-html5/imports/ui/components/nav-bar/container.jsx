import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import { Session } from 'meteor/session';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import userListService from '../user-list/service';
import NoteService from '/imports/ui/components/note/service';
import Service from './service';
import NavBar from './component';

const PUBLIC_CONFIG = Meteor.settings.public;
const ROLE_MODERATOR = PUBLIC_CONFIG.user.role_moderator;

const checkUnreadMessages = ({ groupChatsMessages, groupChats, users }) => {
  const activeChats = userListService.getActiveChats({ groupChatsMessages, groupChats, users });
  const hasUnreadMessages = activeChats
    .filter(chat => chat.userId !== Session.get('idChatOpen'))
    .some(chat => chat.unreadCounter > 0);

  return hasUnreadMessages;
};

const NavBarContainer = ({ children, ...props }) => {
  const usingChatContext = useContext(ChatContext);
  const usingUsersContext = useContext(UsersContext);
  const usingGroupChatContext = useContext(GroupChatContext);
  const { chats: groupChatsMessages } = usingChatContext;
  const { users } = usingUsersContext;
  const { groupChat: groupChats } = usingGroupChatContext;
  const hasUnreadMessages = checkUnreadMessages({ groupChatsMessages, groupChats, users:users[Auth.meetingID] });

  const currentUser = users[Auth.meetingID][Auth.userID];
  const amIModerator = currentUser.role === ROLE_MODERATOR;

  return (
    <NavBar {...props} amIModerator={amIModerator} hasUnreadMessages={hasUnreadMessages}>
      {children}
    </NavBar>
  );
}

export default withTracker(() => {
  const CLIENT_TITLE = getFromUserSettings('bbb_client_title', PUBLIC_CONFIG.app.clientTitle);

  let meetingTitle;
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  }, { fields: { 'meetingProp.name': 1, 'breakoutProps.sequence': 1 } });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    let titleString = `${CLIENT_TITLE} - ${meetingTitle}`;
    if (meetingObject.breakoutProps) {
      const breakoutNum = meetingObject.breakoutProps.sequence;
      if (breakoutNum > 0) {
        titleString = `${breakoutNum} - ${titleString}`;
      }
    }
    document.title = titleString;
  }

  const { connectRecordingObserver, processOutsideToggleRecording } = Service;
  const openPanel = Session.get('openPanel');
  const isExpanded = openPanel !== '';
  const hasUnreadNotes = NoteService.hasUnreadNotes();

  return {
    isExpanded,
    currentUserId: Auth.userID,
    processOutsideToggleRecording,
    connectRecordingObserver,
    meetingId,
    hasUnreadNotes,
    presentationTitle: meetingTitle,
  };
})(NavBarContainer);
