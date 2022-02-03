import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import getFromUserSettings from '/imports/ui/services/users-settings';
import Service from '/imports/ui/components/user-list/service';
import UserList from './component';

const UserListContainer = (props) => <UserList {...props} />;

export default withTracker(({ compact }) => (
  {
    CustomLogoUrl: Service.getCustomLogoUrl(),
    showBranding: getFromUserSettings('bbb_display_branding_area', Meteor.settings.public.app.branding.displayBrandingArea),
  }
))(UserListContainer);
