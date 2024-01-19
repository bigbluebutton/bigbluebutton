import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import userListService from '/imports/ui/components/user-list/service';
import { ChatContext } from '/imports/ui/components/components-data/chat-context/context';
import { GroupChatContext } from '/imports/ui/components/components-data/group-chat-context/context';
import { UsersContext } from '/imports/ui/components/components-data/users-context/context';
import NotesService from '/imports/ui/components/notes/service';
import NavBar from './component';
import { layoutSelectInput, layoutSelectOutput, layoutDispatch } from '../layout/context';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { PANELS } from '/imports/ui/components/layout/enums';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';

const PUBLIC_CONFIG = Meteor.settings.public;

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
  const usingChatContext = useContext(ChatContext);
  const usingUsersContext = useContext(UsersContext);
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const usingGroupChatContext = useContext(GroupChatContext);
  const { chats: groupChatsMessages } = usingChatContext;
  const { users } = usingUsersContext;
  const { groupChat: groupChats } = usingGroupChatContext;
  const activeChats = userListService.getActiveChats({ groupChatsMessages, groupChats, users:users[Auth.meetingID] });
  const { unread, ...rest } = props;

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const navBar = layoutSelectOutput((i) => i.navBar);
  const layoutContextDispatch = layoutDispatch();
  const sharedNotes = layoutSelectInput((i) => i.sharedNotes);
  const { isPinned: notesIsPinned } = sharedNotes;

  const { sidebarContentPanel } = sidebarContent;
  const { sidebarNavPanel } = sidebarNavigation;

  const hasUnreadNotes = sidebarContentPanel !== PANELS.SHARED_NOTES && unread && !notesIsPinned;
  const hasUnreadMessages = checkUnreadMessages(
    { groupChatsMessages, groupChats, users: users[Auth.meetingID] },
  );

  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  const isExpanded = !!sidebarContentPanel || !!sidebarNavPanel;

  const hideNavBar = getFromUserSettings('bbb_hide_nav_bar', false);

  if (hideNavBar || navBar.display === false) return null;

  let pluginNavBarItems = [];
  if (pluginsExtensibleAreasAggregatedState.navBarItems) {
    pluginNavBarItems = [
      ...pluginsExtensibleAreasAggregatedState.navBarItems,
    ];
  }

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
        currentUserId: Auth.userID,
        pluginNavBarItems,
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
  const unread = NotesService.hasUnreadNotes();

  let meetingTitle, breakoutNum, breakoutName, meetingName;
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  }, { fields: { 'meetingProp.name': 1, 'breakoutProps.sequence': 1, meetingId: 1 } });

  if (meetingObject != null) {
    meetingTitle = meetingObject.meetingProp.name;
    let titleString = `${CLIENT_TITLE} - ${meetingTitle}`;
    document.title = titleString;

    if (meetingObject.breakoutProps) {
      breakoutNum = meetingObject.breakoutProps.sequence;
      if (breakoutNum > 0) {
        const breakoutObject = Breakouts.findOne({
          breakoutId: meetingObject.meetingId,
        }, { fields: { shortName: 1 } });
        if (breakoutObject) {
          breakoutName = breakoutObject.shortName;
          meetingName = meetingTitle.replace(`(${breakoutName})`, '').trim();
        }
      }
    }
  }

  return {
    isPinned: NotesService.isSharedNotesPinned(),
    currentUserId: Auth.userID,
    meetingId,
    presentationTitle: meetingTitle,
    breakoutNum,
    breakoutName,
    meetingName,
    unread,
  };
})(NavBarContainer);
