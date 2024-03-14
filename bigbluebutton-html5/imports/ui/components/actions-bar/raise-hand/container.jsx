import React from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import RaiseHandDropdown from './component';
import UserListService from '/imports/ui/components/user-list/service';
import { useMutation } from '@apollo/client';
import { SET_EMOJI_STATUS } from '/imports/ui/core/graphql/mutations/userMutations';

const RaiseHandDropdownContainer = (props) => {
  const [setUserEmojiStatus] = useMutation(SET_EMOJI_STATUS);

  const setEmojiStatus = (emoji) => {
    setUserEmojiStatus({ variables: { emoji } });
  };

  return <RaiseHandDropdown setEmojiStatus={setEmojiStatus} {...props} />;
};

export default withTracker(() => ({
  isDropdownOpen: Session.get('dropdownOpen'),
  getEmojiList: UserListService.getEmojiList(),
}))(RaiseHandDropdownContainer);
