import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import UserList from './component';
import { useStorageKey } from '../../services/storage/hooks';

const UserListContainer = (props) => {
  const CustomLogoUrl = useStorageKey('CustomLogoUrl', 'session');
  return (
    <UserList CustomLogoUrl={CustomLogoUrl} {...props} />
  );
};

export default withTracker(({ compact }) => (
  {
    showBranding: getFromUserSettings('bbb_display_branding_area', window.meetingClientSettings.public.app.branding.displayBrandingArea),
  }
))(UserListContainer);
