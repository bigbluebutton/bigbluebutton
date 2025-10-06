import React, { useContext } from 'react';
import { defineMessages, useIntl } from 'react-intl';
import Auth from '/imports/ui/services/auth';
import getFromUserSettings from '/imports/ui/services/users-settings';
import NavBar from './component';
import { layoutSelectInput, layoutDispatch, layoutSelectOutput } from '../layout/context';
import { PluginsContext } from '/imports/ui/components/components-data/plugin-context/context';
import useCurrentUser from '/imports/ui/core/hooks/useCurrentUser';
import { useShortcut } from '../../core/hooks/useShortcut';
import useMeeting from '../../core/hooks/useMeeting';
import { registerTitleView } from '/imports/utils/dom-utils';
import useHasUnreadNotes from '/imports/ui/components/notes/hooks/useHasUnreadNotes';

const intlMessages = defineMessages({
  defaultViewLabel: {
    id: 'app.title.defaultViewLabel',
    description: 'view name appended to document title',
  },
});

const NavBarContainer = ({ children, ...props }) => {
  const { pluginsExtensibleAreasAggregatedState } = useContext(PluginsContext);
  const intl = useIntl();

  const toggleUserList = useShortcut('toggleUserList');

  const navBar = layoutSelectOutput((i) => i.navBar);
  const layoutContextDispatch = layoutDispatch();

  const { data: currentUserData } = useCurrentUser((user) => ({
    isModerator: user.isModerator,
  }));
  const amIModerator = currentUserData?.isModerator;

  const sidebarContent = layoutSelectInput((i) => i.sidebarContent);
  const sidebarNavigation = layoutSelectInput((i) => i.sidebarNavigation);

  const { sidebarContentPanel } = sidebarContent;
  const { sidebarNavPanel } = sidebarNavigation;

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

  const hasUnreadNotes = useHasUnreadNotes();

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
        hasUnreadNotes,
        ...props,
      }}
      style={{ ...navBar }}
    >
      {children}
    </NavBar>
  );
};

export default NavBarContainer;
