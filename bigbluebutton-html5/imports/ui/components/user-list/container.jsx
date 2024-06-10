import React from 'react';
import getFromUserSettings from '/imports/ui/services/users-settings';
import UserList from './component';
import { useStorageKey } from '../../services/storage/hooks';

const UserListContainer = (props) => {
  const CustomLogoUrl = useStorageKey('CustomLogoUrl', 'session');
  console.log('🚀 -> UserListContainer -> window.meetingClientSettings:', window.meetingClientSettings);
  return (
    <UserList
      CustomLogoUrl={CustomLogoUrl}
      {...props}
      showBranding={getFromUserSettings('bbb_display_branding_area', window.meetingClientSettings.public.app.branding.displayBrandingArea)}
    />
  );
};

export default UserListContainer;
