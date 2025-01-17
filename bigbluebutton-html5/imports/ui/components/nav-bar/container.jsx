import React, { useContext } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import NavBar from './component';
import { layoutSelectInput, layoutDispatch, layoutSelectOutput } from '../layout/context';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import { PANELS } from '/imports/ui/components/layout/enums';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import useChat from '/imports/ui/core/hooks/useChat';
import useHasUnreadNotes from '../notes/hooks/useHasUnreadNotes';
import { useShortcut } from '../../core/hooks/useShortcut';
import useMeeting from '../../core/hooks/useMeeting';
import { registerTitleView } from '/imports/utils/dom-utils';

const intlMessages = defineMessages({
  defaultViewLabel: {
    id: 'app.title.defaultViewLabel',
    description: 'view name appended to document title',
  },
});

const NavBarContainer = ({ children, ...props }) => {
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const unread = useHasUnreadNotes();
  const intl = useIntl();

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

  const PUBLIC_CONFIG = window.meetingClientSettings.public;
  const CLIENT_TITLE = getFromUserSettings('bbb_client_title', PUBLIC_CONFIG.app.clientTitle);
  const IS_DIRECT_LEAVE_BUTTON_ENABLED = getFromUserSettings(
    'bbb_direct_leave_button',
    PUBLIC_CONFIG.app.defaultSettings.application.directLeaveButton,
  );
  const SHOW_SESSION_DETAILS_ON_JOIN = getFromUserSettings(
    'bbb_show_session_details_on_join',
    PUBLIC_CONFIG.layout.showSessionDetailsOnJoin,
  );

  let meetingTitle;
  let breakoutNum;
  let breakoutName;
  let meetingName;

  const { data: meeting } = useMeeting((m) => ({
    name: m.name,
    meetingId: m.meetingId,
    breakoutPolicies: {
      sequence: m.breakoutPolicies.sequence,
    },
  }));

  if (meeting) {
    meetingTitle = meeting.name;
    const titleString = `${CLIENT_TITLE} - ${meetingTitle}`;
    document.title = titleString;
    registerTitleView(intl.formatMessage(intlMessages.defaultViewLabel));

    if (meeting.breakoutPolicies) {
      breakoutNum = meeting.breakoutPolicies.sequence;
      if (breakoutNum > 0) {
        breakoutName = meetingTitle;
        meetingName = meetingTitle.replace(`(${breakoutName})`, '').trim();
      }
    }
  }

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
        meetingId: meeting?.meetingId,
        presentationTitle: meetingTitle,
        breakoutNum,
        breakoutName,
        meetingName,
        isDirectLeaveButtonEnabled: IS_DIRECT_LEAVE_BUTTON_ENABLED,
        // TODO: Remove/Replace
        isMeteorConnected: true,
        hideTopRow: navBar.hideTopRow,
        showSessionDetailsOnJoin: SHOW_SESSION_DETAILS_ON_JOIN,
        ...props,
      }}
      style={{ ...navBar }}
    >
      {children}
    </NavBar>
  );
};

export default NavBarContainer;
