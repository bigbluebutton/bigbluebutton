import React from 'react';
import getFromUserSettings from '/imports/ui/services/users-settings';
import { isDarkThemeEnabled } from '/imports/ui/components/app/service';
import UserList from './component';
import { useStorageKey } from '../../services/storage/hooks';

const UserListContainer = (props) => {
  const CustomLogoUrl = useStorageKey('CustomLogoUrl', 'session');
  const CustomDarkLogoUrl = useStorageKey('CustomDarkLogoUrl', 'session');
  const DarkModeIsEnabled = isDarkThemeEnabled();

  return (
    <UserList
      CustomLogoUrl={CustomLogoUrl}
      CustomDarkLogoUrl={CustomDarkLogoUrl}
      DarkModeIsEnabled={DarkModeIsEnabled}
      {...props}
      showBranding={getFromUserSettings('bbb_display_branding_area', window.meetingClientSettings.public.app.branding.displayBrandingArea)}
    />
  );
};

export default UserListContainer;
