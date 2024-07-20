import React from 'react';
import RaiseHandDropdown from './component';
import UserListService from '/imports/ui/components/user-list/service';
import { useMutation } from '@apollo/client';
import { SET_EMOJI_STATUS } from '/imports/ui/core/graphql/mutations/userMutations';
import { useStorageKey } from '/imports/ui/services/storage/hooks';

const RaiseHandDropdownContainer = (props) => {
  const [setUserEmojiStatus] = useMutation(SET_EMOJI_STATUS);
  const isDropdownOpen = useStorageKey('dropdownOpen');
  const getEmojiList = UserListService.getEmojiList();
  const setEmojiStatus = (emoji) => {
    setUserEmojiStatus({ variables: { emoji } });
  };

  return (
    <RaiseHandDropdown
      setEmojiStatus={setEmojiStatus}
      getEmojiList={getEmojiList}
      isDropdownOpen={isDropdownOpen}
      {...props}
    />
  );
};

export default RaiseHandDropdownContainer;
