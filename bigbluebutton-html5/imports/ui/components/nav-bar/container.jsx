import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import userListService from '/imports/ui/components/user-list/service';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import NoteService from '/imports/ui/components/note/service';
import UserlsitService from '/imports/ui/components/user-list/service';
import Service from './service';
import NavBar from './component';
import LayoutContext from '../layout/context';

const PUBLIC_CONFIG = Meteor.settings.public;
const ROLE_MODERATOR = PUBLIC_CONFIG.user.role_moderator;

const checkUnreadMessages = ({
  groupChatsMessages, groupChats, users, idChatOpen,
}) => {
  const activeChats = userListService.getActiveChats({ groupChatsMessages, groupChats, users });
  const hasUnreadMessages = activeChats
    .filter((chat) => chat.userId !== idChatOpen)
    .some((chat) => chat.unreadCounter > 0);

  return hasUnreadMessages;
};

const NavBarContainer = ({ children, ...props }) => {
  const layoutContext = useContext(LayoutContext);
  const { layoutContextState, layoutContextDispatch } = layoutContext;
  const usingChatContext = useContext(ChatContext);
  const usingUsersContext = useContext(UsersContext);
  const usingGroupChatContext = useContext(GroupChatContext);
  const { chats: groupChatsMessages } = usingChatContext;
  const { users } = usingUsersContext;
  const { groupChat: groupChats } = usingGroupChatContext;
  const activeChats = UserlsitService.getActiveChats({ groupChatsMessages, groupChats, users:users[Auth.meetingID] });
  const { ...rest } = props;
  const {
    input, output,
  } = layoutContextState;
  const { sidebarContent, sidebarNavigation } = input;
  const { sidebarNavPanel } = sidebarNavigation;
  const { sidebarContentPanel } = sidebarContent;
  const { navBar } = output;
  const hasUnreadNotes = NoteService.hasUnreadNotes(sidebarContentPanel);
  const hasUnreadMessages = checkUnreadMessages(
    { groupChatsMessages, groupChats, users: users[Auth.meetingID] },
  );

  const isExpanded = !!sidebarContentPanel || !!sidebarNavPanel;

  const currentUser = users[Auth.meetingID][Auth.userID];
  const amIModerator = currentUser.role === ROLE_MODERATOR;

  const hideNavBar = getFromUserSettings('bbb_hide_nav_bar', false);

  if (hideNavBar) return null;

  return (
    <NavBar
      {...{
        amIModerator,
        hasUnreadMessages,
        hasUnreadNotes,
        sidebarNavPanel,
        sidebarContentPanel,
        sidebarNavigation,
        sidebarContent,
        layoutContextDispatch,
        isExpanded,
        activeChats,
        ...rest,
      }}
      style={{ ...navBar }}
    >
      {children}
    </NavBar>
  );
};

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

  return {
    currentUserId: Auth.userID,
    processOutsideToggleRecording,
    connectRecordingObserver,
    meetingId,
    presentationTitle: meetingTitle,
  };
})(NavBarContainer);
