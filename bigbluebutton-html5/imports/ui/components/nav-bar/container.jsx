import React, { useContext } from 'react';
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import Meetings from '/imports/api/meetings';
import Breakouts from '/imports/api/breakouts';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import NavBar from './component';
import { layoutSelectInput, layoutSelectOutput, layoutDispatch } from '../layout/context';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { PANELS } from '/imports/ui/components/layout/enums';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useChat from '/imports/ui/core/hooks/useChat';
import useHasUnreadNotes from '../notes/notes-graphql/hooks/useHasUnreadNotes';
import { useShortcut } from '../../core/hooks/useShortcut';

const PUBLIC_CONFIG = window.meetingClientSettings.public;

const NavBarContainer = ({ children, ...props }) => {
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const unread = useHasUnreadNotes();

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);
  const navBar = layoutSelectOutput((i) => i.navBar);
  const layoutContextDispatch = layoutDispatch();
  const sharedNotes = layoutSelectInput((i) => i.sharedNotes);
  const { isPinned: notesIsPinned } = sharedNotes;

  const { sidebarContentPanel } = sidebarContent;
  const { sidebarNavPanel } = sidebarNavigation;

  const toggleUserList = useShortcut('toggleUserList');

  const hasUnreadNotes = sidebarContentPanel !== PANELS.SHARED_NOTES && unread && !notesIsPinned;

  const { data: chats } = useChat((chat) => ({
    totalUnread: chat.totalUnread,
  }));

  const hasUnreadMessages = chats && chats.reduce((acc, chat) => acc + chat?.totalUnread, 0) > 0;

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
        currentUserId: Auth.userID,
        pluginNavBarItems,
        shortcuts: toggleUserList,
        ...props,
      }}
      style={{ ...navBar }}
    >
      {children}
    </NavBar>
  );
};

export default withTracker(() => {
  const CLIENT_TITLE = getFromUserSettings('bbb_client_title', PUBLIC_CONFIG.app.clientTitle);

  let meetingTitle, breakoutNum, breakoutName, meetingName;
  const meetingId = Auth.meetingID;
  const meetingObject = Meetings.findOne({
    meetingId,
  }, { fields: { name: 1, 'breakoutPolicies.sequence': 1, meetingId: 1 } });

  if (meetingObject != null) {
    meetingTitle = meetingObject.name;
    let titleString = `${CLIENT_TITLE} - ${meetingTitle}`;
    document.title = titleString;

    if (meetingObject.breakoutPolicies) {
      breakoutNum = meetingObject.breakoutPolicies.sequence;
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

  const IS_DIRECT_LEAVE_BUTTON_ENABLED = getFromUserSettings(
    'bbb_direct_leave_button',
    PUBLIC_CONFIG.app.defaultSettings.application.directLeaveButton,
  );

  return {
    currentUserId: Auth.userID,
    meetingId,
    presentationTitle: meetingTitle,
    breakoutNum,
    breakoutName,
    meetingName,
    isDirectLeaveButtonEnabled: IS_DIRECT_LEAVE_BUTTON_ENABLED,
    isMeteorConnected: Meteor.status().connected,
  };
})(NavBarContainer);
