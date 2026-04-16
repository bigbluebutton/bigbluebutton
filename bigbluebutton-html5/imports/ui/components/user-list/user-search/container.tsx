import React from 'react';
import UserSearch from './component';
import isUserListSearchEnabled from './service';

interface UserSearchContainerProps {
  onSearchChange: (query: string) => void;
  isQueryLoading: boolean;
}

const UserSearchContainer: React.FC<UserSearchContainerProps> = ({ onSearchChange, isQueryLoading }) => {
  if (!isUserListSearchEnabled()) return null;

  return (
    <UserSearch
      onSearchChange={onSearchChange}
      isQueryLoading={isQueryLoading}
    />
  );
};

export default UserSearchContainer;
