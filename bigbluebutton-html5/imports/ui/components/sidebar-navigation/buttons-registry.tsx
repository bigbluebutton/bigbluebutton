import React from 'react';
import ProfileListItem from './profile-list-item/component';
import UsersListItem from './users-list-item/component';
import ChatListItem from './chat-list-item/component';
import UserNotesListItemContainer from './user-notes-list-item/component';
import AppsListItem from './apps-list-item/component';
import AudioCaptionsListItem from './audio-captions-list-item/component';
import LearningDashboardListItem from './learning-dashboard-list-item/component';
import SettingsListItem from './settings-list-item/component';

// 'pinned-apps' is intentionally not in this map: it needs the
// sidebarNavigationInput prop and is special-cased in component.tsx.
export const PINNED_APPS_BUTTON_ID = 'pinned-apps';

const SIDEBAR_BUTTONS_REGISTRY: Record<string, React.ComponentType> = {
  profile: ProfileListItem,
  'user-list': UsersListItem,
  chat: ChatListItem,
  notes: UserNotesListItemContainer,
  'apps-gallery': AppsListItem,
  'audio-captions': AudioCaptionsListItem,
  'learning-dashboard': LearningDashboardListItem,
  settings: SettingsListItem,
};

export default SIDEBAR_BUTTONS_REGISTRY;
