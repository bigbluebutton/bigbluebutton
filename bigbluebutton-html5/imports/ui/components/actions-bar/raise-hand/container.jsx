import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import RaiseHandDropdown from './component';
import UserListService from '/imports/ui/components/user-list/service';

const RaiseHandDropdownContainer = (props) => (
  <RaiseHandDropdown {...props} />
);

export default withTracker(() => ({
  isDropdownOpen: Session.get('dropdownOpen'),
  getEmojiList: UserListService.getEmojiList(),
}))(RaiseHandDropdownContainer);
